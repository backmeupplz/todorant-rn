import { sharedDelegationStore } from '@stores/DelegationStore'
import {
  cloneDelegation,
  getLocalDelegation,
  getMismatchesWithServer,
  removeDelegation,
} from '@utils/delegations'
import {
  database,
  tagsCollection,
  todosCollection,
  usersCollection,
} from '@utils/watermelondb/wmdb'
import { Q, Query } from '@nozbe/watermelondb'
import { MelonUser } from '@models/MelonTodo'
import { TagColumn, TodoColumn, UserColumn } from '@utils/watermelondb/tables'
import { SyncDatabaseChangeSet } from '@nozbe/watermelondb/sync'
import { decrypt } from '@utils/encryption'
import { getTitle } from '@models/Todo'
import { sharedSessionStore } from '@stores/SessionStore'
import { sanitizeLikeString } from '@nozbe/watermelondb/QueryDescription'

export async function updateOrCreateDelegation(
  delegation: Partial<MelonUser>,
  delegator: boolean,
  forceWrite = false
): Promise<MelonUser> {
  // Get local user if exists
  const localDelegate = await getLocalDelegation(delegation, delegator)
  if (localDelegate) {
    if (forceWrite) {
      const updatedUser = localDelegate.updateUser(localDelegate)
      return await updatedUser
    }
    return localDelegate.prepareUpdate((delegate) =>
      Object.assign(delegate, delegation)
    )
  }
  // Create new user in place if need
  if (forceWrite) {
    let createdUser!: MelonUser
    await database.write(async () => {
      createdUser = await usersCollection.create((delegate) => {
        Object.assign(delegate, delegation)
        delegate.isDelegator = delegator
      })
    })
    return createdUser
  }
  return usersCollection.prepareCreate((delegate) => {
    Object.assign(delegate, delegation)
    delegate.isDelegator = delegator
  })
}

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
  console.log(objects)
  const lastSyncDate = sharedDelegationStore.updatedAt
  if (!lastSyncDate && sharedSessionStore.user) {
    await updateOrCreateDelegation(
      { _id: sharedSessionStore.user._id },
      false,
      true
    )
    await updateOrCreateDelegation(
      { _id: sharedSessionStore.user._id },
      true,
      true
    )
  }

  // Get local delegators and delegates
  const wmdbDelegators = getDelegations(true)
  const wmdbDelegates = getDelegations(false)
  // Filter delegators and delegates that changed locally
  const delegatorsChangedLocally = await changedLocallyDelegation(
    wmdbDelegators,
    lastSyncDate
  )
  const delegatesChangedLocally = await changedLocallyDelegation(
    wmdbDelegates,
    lastSyncDate
  )

  const toDelete = [] as MelonUser[]
  const toUpdateOrCreate = [] as MelonUser[]
  if (objects.delegateUpdated && lastSyncDate) {
    toDelete.push(
      ...(await findMissMatches(wmdbDelegators, objects.delegators)),
      ...(await findMissMatches(wmdbDelegates, objects.delegates))
    )
  }
  toUpdateOrCreate.push(
    ...(await getUpdatedOrCreated(objects.delegators, true)),
    ...(await getUpdatedOrCreated(objects.delegates, false))
  )
  const delegatorsToDelete = delegatorsChangedLocally.filter(
    (delegator) => !!delegator.deleted
  )
  const delegatesToDelete = delegatesChangedLocally.filter(
    (delegate) => !!delegate.deleted
  )
  // Get delegates without data (they were accepted offline or didnt load data properly when accepted)
  const delegatorsWithoutData = delegatorsChangedLocally.filter(
    (delegator) => !delegator._id
  )
  // Get delegators which should be pushed on server
  const delegatorsToPush = [...delegatorsWithoutData, ...delegatorsToDelete]
  // If there's no data that should be pushed on server that just completeSync
  if (!delegatorsToPush.length && !delegatesChangedLocally.length) {
    const arrayTest = [
      ...new Set([
        ...toUpdateOrCreate.filter((user) => {
          if (user._id !== sharedSessionStore.user?._id) {
            return !!user.name
          }
          return true
        }),
        ...toDelete,
      ]),
    ]
    // Complete sync
    await database.write(async () => await database.batch(...arrayTest))
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
    })
  )
  await Promise.all(
    savedPushedDelegations.delegates.map(async (delegate) => {
      toUpdateOrCreate.push(await updateOrCreateDelegation(delegate, false))
    })
  )
  await database.write(
    async () =>
      await database.batch(...[...new Set([...toUpdateOrCreate, ...toDelete])])
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
  let showed = false
  for (const updated of serverObjects.todos.updated) {
    if (updated.delegator_id) {
      if (!showed) {
        console.log(await usersCollection.query().fetch())
        showed = true
      }
      console.log(updated.user_id)
      // console.log('test')
      const user = await (
        await usersCollection
          .query(
            Q.where(UserColumn._id, sanitizeLikeString(updated.user_id._id)),
            Q.where(UserColumn.isDelegator, false)
          )
          .fetch()
      )[0] // getLocalDelegation(updated.delegator_id, true)// await getLocalDelegation(updated.user_id, false)
      console.log(user)
      console.log(user?.name)
      if (user) {
        updated.user_id = user.id
      } else {
        updated.user_id = null
        updated.is_deleted = true
      }
      console.log(updated.user_id)
      console.log(updated)
      const delegator = await (
        await usersCollection
          .query(
            Q.where(
              UserColumn._id,
              sanitizeLikeString(updated.delegator_id._id)
            ),
            Q.where(UserColumn.isDelegator, true)
          )
          .fetch()
      )[0] // getLocalDelegation(updated.delegator_id, true)
      console.log()
      console.log(delegator)
      console.log('lol')
      console.log(delegator?.name)
      if (delegator) {
        updated.delegator_id = delegator.id
      } else {
        updated.delegator_id = null
        updated.is_deleted = true
      }
      console.log(updated.delegator_id)
      // updated.user_id = (
      //   await updateOrCreateDelegation(
      //     updated.user_id as MelonUser,
      //     false,
      //     true
      //   )
      // ).id
      // updated.delegator_id = (
      //   await updateOrCreateDelegation(
      //     updated.delegator_id as MelonUser,
      //     true,
      //     true
      //   )
      // ).id
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

function getDelegations(delegator: boolean) {
  return usersCollection.query(
    Q.where(UserColumn.isDelegator, delegator),
    Q.where(UserColumn._id, Q.notEq(sharedSessionStore?.user?._id!))
  )
}

async function changedLocallyDelegation(
  query: Query<MelonUser>,
  timestamp?: Date
) {
  return await (timestamp
    ? query.extend(Q.where(UserColumn.updatedAt, Q.gt(timestamp.getTime())))
    : query
  ).fetch()
}

async function findMissMatches(
  localDelegation: Query<MelonUser>,
  serverDelegation: MelonUser[]
) {
  return getMismatchesWithServer(
    await localDelegation.fetch(),
    serverDelegation
  )
}

async function getUpdatedOrCreated(
  delegations: MelonUser[],
  delegator: boolean
) {
  const updatedOrCreated: MelonUser[] = []
  for (const delegation of delegations) {
    updatedOrCreated.push(await updateOrCreateDelegation(delegation, delegator))
  }
  return updatedOrCreated
}
