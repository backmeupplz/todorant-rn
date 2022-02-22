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
import { translate } from '@utils/i18n'

export async function updateOrCreateDelegation(
  delegation: Partial<MelonUser>,
  delegator: boolean,
  forceWrite = false
): Promise<MelonUser> {
  // Get local user if exists
  const localDelegate = await getLocalDelegation(delegation, delegator)
  if (localDelegate) {
    if (forceWrite) {
      const updatedUser = await localDelegate.updateUser(
        localDelegate,
        'updating user'
      )
      return updatedUser
    }
    return localDelegate.prepareUpdateWithDescription(
      (delegate) => Object.assign(delegate, delegation),
      'updaitng or creating delegation'
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

async function createAccountHolderDelegations(_id: string) {
  await updateOrCreateDelegation({ _id }, false, true)
  await updateOrCreateDelegation({ _id }, true, true)
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
    delegators: (Omit<MelonUser, 'id'> & { invalid?: boolean })[]
    delegates: Omit<MelonUser, 'id'>[]
  }>,
  completeSync: () => void
) {
  const lastSyncDate = sharedDelegationStore.updatedAt
  if (!lastSyncDate && sharedSessionStore.user?._id) {
    createAccountHolderDelegations(sharedSessionStore.user._id)
  }
  // Get local delegates and delegators
  const [delegatesQuery, delegatorsQuery] = getDelegations()
  // Filter delegators and delegates that changed locally
  const [delegatesChangedLocally, delegatorsChangedLocally] =
    await changedLocallyDelegation(
      delegatesQuery,
      delegatorsQuery,
      lastSyncDate
    )

  const delegationsToDelete = new Map<string, MelonUser>()
  const delegationsToUpdateOrCreate = new Map<string, MelonUser>()

  if (objects.delegateUpdated && lastSyncDate) {
    const delegatesToRemove = await findMissMatches(
      delegatesQuery,
      objects.delegates
    )
    const delegatorsToRemove = await findMissMatches(
      delegatorsQuery,
      objects.delegators
    )
    ;[...delegatesToRemove, ...delegatorsToRemove].forEach((delegation) => {
      delegationsToDelete.set(delegation.id, delegation)
    })
  }
  try {
    await updateOrCreate(objects.delegators, true, delegationsToDelete)
    await updateOrCreate(objects.delegates, false, delegationsToDelete)
  } catch (err) {
    throw Error(
      translate('errors.errorDuring', {
        reason: translate('errors.sync.updatingOrCreating'),
        originalError: err,
      })
    )
  }
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
    const preparedToDelete = [...delegationsToDelete.values()].map(
      (delegation) =>
        delegation.prepareDestroyPermanentlyWithDescription(
          'preparing destroy when nothing to push'
        )
    )
    // Complete sync
    await database.write(async () => await database.batch(...preparedToDelete))
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
  try {
    for (const delegate of savedPushedDelegations.delegates) {
      const delegateLocally = await getLocalDelegation(delegate, false)
      if (!delegateLocally) {
        continue
      }
      if (
        delegationsToUpdateOrCreate.has(delegateLocally.id) ||
        delegationsToDelete.has(delegateLocally.id)
      ) {
        continue
      }
      delegationsToUpdateOrCreate.set(
        delegateLocally.id,
        await updateOrCreateDelegation(delegate, false)
      )
    }
  } catch (err) {
    throw Error(
      translate('errors.errorDuring', {
        reason: translate('errors.sync.updatingPushedDelegates'),
        originalError: err,
      })
    )
  }
  try {
    for (const delegator of savedPushedDelegations.delegators) {
      const delegatorLocally = await getLocalDelegation(delegator, true)
      if (!delegatorLocally) {
        continue
      }
      if (
        delegationsToUpdateOrCreate.has(delegatorLocally.id) ||
        delegator.invalid ||
        delegationsToDelete.has(delegatorLocally.id)
      ) {
        continue
      }
      delegationsToUpdateOrCreate.set(
        delegatorLocally.id,
        await updateOrCreateDelegation(delegator, true)
      )
    }
  } catch (err) {
    throw Error(
      translate('errors.errorDuring', {
        reason: translate('errors.sync.updatingPushedDelegators'),
        originalError: err,
      })
    )
  }
  await database.write(
    async () => await database.batch(...delegationsToUpdateOrCreate.values())
  )
  try {
    // Delete after after sync
    for (const delegator of delegatorsToDelete) {
      if (delegationsToDelete.has(delegator.id)) {
        continue
      }
      const localMarked = await removeDelegation(
        delegator,
        true,
        false,
        'removing locally marked as deleted delegators'
      )
      if (localMarked) {
        delegationsToDelete.set(delegator.id, localMarked)
      }
    }
  } catch (err) {
    throw Error(
      translate('errors.errorDuring', {
        reason: translate('errors.sync.removingDelegators'),
        originalError: err,
      })
    )
  }
  try {
    for (const delegate of delegatesToDelete) {
      if (delegationsToDelete.has(delegate.id)) {
        continue
      }
      const localMarked = await removeDelegation(
        delegate,
        false,
        false,
        'removing locally marked as deleted delegates'
      )
      if (localMarked) {
        delegationsToDelete.set(delegate.id, localMarked)
      }
    }
  } catch (err) {
    throw Error(
      translate('errors.errorDuring', {
        reason: translate('errors.sync.removingDelegates'),
        originalError: err,
      })
    )
  }
  try {
    for (const delegator of savedPushedDelegations.delegators) {
      const delegatorLocally = await getLocalDelegation(delegator, true)
      if (!delegatorLocally) {
        continue
      }
      if (delegationsToDelete.has(delegatorLocally.id) || !delegator.invalid) {
        continue
      }
      const localMarked = await removeDelegation(
        delegator,
        true,
        false,
        'removing pushed delegators'
      )
      if (localMarked) {
        delegationsToDelete.set(delegatorLocally.id, localMarked)
      }
    }
  } catch (err) {
    throw Error(
      translate('errors.errorDuring', {
        reason: translate('errors.sync.removingPushedDelegators'),
        originalError: err,
      })
    )
  }
  const preparedToDelete = [...delegationsToDelete.values()].map(
    (delegation) => {
      try {
        return delegation.prepareDestroyPermanentlyWithDescription(
          'preparing destroy before batch'
        )
      } catch (err) {
        throw Error(
          translate('errors.errorDuring', {
            reason: translate('errors.sync.preapringDelegationsForDeleting', {
              delegationId: delegation.id,
            }),
            originalError: err,
          })
        )
      }
    }
  )
  await database.write(async () => await database.batch(...preparedToDelete))
  // Complete sync
  completeSync()
}

export async function onWMDBObjectsFromServer(
  serverObjects: SyncDatabaseChangeSet
) {
  const todos = []
  const tags = []
  for (const updated of serverObjects.tags.updated) {
    const localTag = (
      await tagsCollection
        .query(
          Q.or(
            Q.where(TagColumn._id, updated.server_id),
            Q.where(TagColumn._tempSyncId, updated.client_id || null)
          )
        )
        .fetch()
    )[0]
    if (localTag) {
      updated.id = localTag.id
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
        showed = true
      }
      const user = await (
        await usersCollection
          .query(
            Q.where(UserColumn._id, sanitizeLikeString(updated.user_id._id)),
            Q.where(UserColumn.isDelegator, false)
          )
          .fetch()
      )[0]
      if (user) {
        updated.user_id = user.id
      } else {
        updated.user_id = null
        updated.is_deleted = true
      }
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
      )[0]
      if (delegator) {
        updated.delegator_id = delegator.id
      } else {
        updated.delegator_id = null
        updated.is_deleted = true
      }
    }
    try {
      updated.text = decrypt(updated.text) || updated.text
    } catch (e) {
      // Do nothing
    }
    // Todo: make same for tags
    const localTodo = (
      await todosCollection
        .query(
          Q.or(
            Q.where(TodoColumn._id, updated.server_id),
            Q.where(TodoColumn._tempSyncId, updated.client_id || null)
          )
        )
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

function getDelegations() {
  const baseQuery = usersCollection.query(
    Q.where(UserColumn._id, Q.notEq(sharedSessionStore?.user?._id!))
  )
  const delegators = baseQuery.extend(Q.where(UserColumn.isDelegator, true))
  const delegates = baseQuery.extend(Q.where(UserColumn.isDelegator, false))
  return [delegates, delegators]
}

async function changedLocallyDelegation(
  delegatesQuery: Query<MelonUser>,
  delegatorsQuery: Query<MelonUser>,
  timestamp?: Date
) {
  if (!timestamp) {
    return Promise.all([delegatesQuery.fetch(), delegatorsQuery.fetch()])
  }
  const queryExtender = Q.where(UserColumn.updatedAt, Q.gt(timestamp.getTime()))
  return Promise.all([
    delegatesQuery.extend(queryExtender).fetch(),
    delegatorsQuery.extend(queryExtender).fetch(),
  ])
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

async function updateOrCreate(
  delegations: MelonUser[],
  delegator: boolean,
  deletedDelegations: Map<string, MelonUser>
) {
  const updatedOrCreated: MelonUser[] = []
  for (const delegation of delegations) {
    if (deletedDelegations.has(delegation.id)) {
      return
    }
    updatedOrCreated.push(
      await updateOrCreateDelegation(delegation, delegator, true)
    )
  }
  return updatedOrCreated
}
