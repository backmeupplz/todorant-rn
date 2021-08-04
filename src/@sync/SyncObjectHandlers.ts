import { sharedDelegationStore } from '@stores/DelegationStore'
import {
  cloneDelegation,
  getMismatchesWithServer,
  removeDelegation,
  updateOrCreateDelegation,
} from '@utils/delegations'
import { database, usersCollection } from '@utils/wmdb'
import { Q } from '@nozbe/watermelondb'
import { MelonUser } from '@models/MelonTodo'
import { UserColumn } from '@utils/melondb'

export async function onDelegationObjectsFromServer(
  objects: {
    delegators: MelonUser[]
    delegates: MelonUser[]
    delegateUpdated: boolean
  },
  pushBack: (objects: {
    delegators: MelonUser[]
    delegates: MelonUser[]
  }) => Promise<{
    delegators: (MelonUser & { invalid?: boolean })[]
    delegates: MelonUser[]
  }>,
  completeSync: () => void
) {
  const lastSyncDate = sharedDelegationStore.updatedAt
  // Get local delegators
  const realmDelegators = usersCollection.query(
    Q.where(UserColumn.isDelegator, true)
  )
  // Get local delegates
  const realmDelegates = usersCollection.query(
    Q.where(UserColumn.isDelegator, Q.notEq(true))
  )
  // Filter delegators that changed locally
  const delegatorsChangedLocally = await (lastSyncDate
    ? realmDelegators.extend(
        Q.where(UserColumn.updatedAt, Q.gt(lastSyncDate.getTime()))
      )
    : realmDelegators
  ).fetch()
  // Filter delegates that changed locally
  const delegatesChangedLocally = await (lastSyncDate
    ? realmDelegates.extend(Q.where('updated_at', Q.gt(lastSyncDate.getTime())))
    : realmDelegates
  ).fetch()
  const toDelete = [] as MelonUser[]
  const toUpdateOrCreate = [] as MelonUser[]
  // Pull
  // Create and delete delegates and delegators
  // Delegators
  // Check if delegators list changed on server
  if (objects.delegateUpdated) {
    // If so then remove that delegates which exists locally but not on server
    toDelete.push(
      ...getMismatchesWithServer(
        await realmDelegators.fetch(),
        objects.delegators
      )
    )
  }
  // Create new or just update existing delegators
  await Promise.all(
    objects.delegators.map(async (delegator) => {
      return toUpdateOrCreate.push(
        await updateOrCreateDelegation(delegator, true)
      )
    })
  )
  // Delegates
  // Check if delegates list changed on server
  if (objects.delegateUpdated) {
    // If so then remove that delegates which exists locally but not on server
    toDelete.push(
      ...getMismatchesWithServer(
        await realmDelegates.fetch(),
        objects.delegates
      )
    )
  }
  // Create new or just update existing delegates
  await Promise.all(
    objects.delegates.map(async (delegate) => {
      return toUpdateOrCreate.push(
        await updateOrCreateDelegation(delegate, false)
      )
    })
  )
  // Push
  // Get delegators which should be removed
  const delegatorsToDelete = delegatorsChangedLocally.filter(
    (delegator) => !!delegator.deleted
  )
  // Get delegates without data (they were accepted offline or didnt load data properly when accepted)
  const delegatorsWithoutData = delegatorsChangedLocally.filter(
    (delegator) => !delegator._id
  )
  // Get delegators which should be pushed on server
  const delegatorsToPush = [...delegatorsWithoutData, ...delegatorsToDelete]
  // Get delegates which should be removed
  const delegatesToDelete = delegatesChangedLocally.filter(
    (delegate) => !!delegate.deleted
  )
  // If there's no data that should be pushed on server that just completeSync
  if (!delegatorsToPush.length && !delegatesChangedLocally.length) {
    // Complete sync
    await database.write(
      async () => await database.batch(...toUpdateOrCreate, ...toDelete)
    )
    completeSync()
    return
  }
  // Push data on server
  const savedPushedDelegations = await pushBack({
    delegates: delegatesChangedLocally.map((delegate) =>
      cloneDelegation(delegate)
    ),
    delegators: delegatorsToPush.map((delegator) => cloneDelegation(delegator)),
  })
  // Delete after after sync
  await Promise.all(
    delegatorsToDelete.map(async (delegator) => {
      const localMarked = await removeDelegation(delegator, true)
      if (localMarked) toDelete.push(localMarked)
    })
  )
  await Promise.all(
    delegatesToDelete.map(async (delegate) => {
      const localMarked = await removeDelegation(delegate, false)
      if (localMarked) toDelete.push(localMarked)
    })
  )
  // Fill delegations with missing info
  await Promise.all(
    savedPushedDelegations.delegators.map(async (delegator) => {
      if (delegator.invalid) {
        const localMarked = await removeDelegation(delegator, true)
        if (localMarked) toDelete.push(localMarked)
        return
      }
      //toUpdateOrCreate.push(await updateOrCreateDelegation(delegator, true))
    })
  )
  await Promise.all(
    savedPushedDelegations.delegates.map(async (delegate) => {
      toUpdateOrCreate.push(await updateOrCreateDelegation(delegate, false))
    })
  )
  await database.write(
    async () => await database.batch(...toUpdateOrCreate, ...toDelete)
  )
  // Complete sync
  completeSync()
}
