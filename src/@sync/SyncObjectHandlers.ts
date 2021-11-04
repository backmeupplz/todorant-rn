import { sharedDelegationStore } from '@stores/DelegationStore'
import {
  cloneDelegation,
  getMismatchesWithServer,
  removeDelegation,
  updateOrCreateDelegation,
} from '@utils/delegations'
import {
  database,
  tagsCollection,
  todosCollection,
  usersCollection,
} from '@utils/watermelondb/wmdb'
import { Q } from '@nozbe/watermelondb'
import { MelonUser } from '@models/MelonTodo'
import { TagColumn, TodoColumn, UserColumn } from '@utils/watermelondb/tables'
import { SyncDatabaseChangeSet } from '@nozbe/watermelondb/sync'
import { decrypt } from '@utils/encryption'
import { getTitle } from '@models/Todo'

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
    ? realmDelegates.extend(
        Q.where(UserColumn.updatedAt, Q.gt(lastSyncDate.getTime()))
      )
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

export async function onWMDBObjectsFromServer(
  serverObjects: SyncDatabaseChangeSet
) {
  const todos = []
  const tags = []
  for (const updated of serverObjects.tags.updated) {
    const localTodo = (
      await tagsCollection
        .query(Q.where(TagColumn._id, updated.server_id))
        .fetch()
    )[0]
    if (localTodo) {
      updated.id = localTodo.id
      tags.push(updated)
      continue
    }
    updated.id = updated.server_id
    tags.push(updated)
  }
  for (const updated of serverObjects.todos.updated) {
    if (updated.delegator_id) {
      updated.user_id = (
        await updateOrCreateDelegation(
          updated.user_id as MelonUser,
          false,
          true
        )
      ).id
      updated.delegator_id = (
        await updateOrCreateDelegation(
          updated.delegator_id as MelonUser,
          true,
          true
        )
      ).id
    }
    try {
      updated.text = decrypt(updated.text) || updated.text
    } catch (e) {
      // Do nothing
    }
    const localTodo = (
      await todosCollection
        .query(Q.where(TodoColumn._id, updated.server_id))
        .fetch()
    )[0]
    updated.exact_date_at = new Date(
      getTitle({
        monthAndYear: updated.month_and_year,
        date: updated.date,
      })
    ).getTime()
    if (localTodo) {
      updated.id = localTodo.id
      todos.push(updated)
      continue
    }
    updated.id = updated.server_id
    todos.push(updated)
  }
  serverObjects.todos.updated = todos
  serverObjects.tags.updated = tags
}
