import { sharedTagStore } from '@stores/TagStore'
import { sharedTodoStore } from '@stores/TodoStore'
import { Tag, cloneTag } from '@models/Tag'
import { getTagById } from '@utils/getTagById'
import { cloneTodo, getTitle, Todo } from '@models/Todo'
import { getTodoById } from '@utils/getTodoById'
import { decrypt, encrypt } from '@utils/encryption'
import { refreshWidgetAndBadgeAndWatch } from '@utils/refreshWidgetAndBadgeAndWatch'
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
} from '@utils/wmdb'
import { Q } from '@nozbe/watermelondb'
import { MelonTodo, MelonUser } from '@models/MelonTodo'
import { omit } from 'lodash'
import { MelonTag } from '@models/MelonTag'
import { TagColumn, TodoColumn, UserColumn } from '@utils/melondb'

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
      toUpdateOrCreate.push(await updateOrCreateDelegation(delegator, true))
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

export async function onTagsObjectsFromServer(
  tagsChangedOnServer: MelonTag[],
  pushBack: (objects: MelonTag[]) => Promise<MelonTag[]>,
  completeSync: () => void
) {
  // Modify dates
  tagsChangedOnServer.forEach((tag) => {
    tag.updatedAt = new Date(tag.updatedAt)
    tag.createdAt = new Date(tag.createdAt)
  })
  // Get variables
  const serverTagsMap = tagsChangedOnServer.reduce((p, c) => {
    if (c._id) {
      p[c._id] = c
    }
    return p
  }, {} as { [index: string]: MelonTag })
  const allTags = tagsCollection
  const lastSyncDate = sharedTagStore.updatedAt
  const tagsChangedLocally = lastSyncDate
    ? allTags.query(Q.where(TagColumn.updatedAt, Q.gt(lastSyncDate.getTime())))
    : allTags.query()
  const toUpdate = [] as MelonTag[]
  const toCreate = [] as MelonTag[]
  // Pull
  for (const serverTag of tagsChangedOnServer) {
    if (!serverTag._id) {
      continue
    }
    let localTag = await getTagById(serverTag._id)
    if (localTag) {
      if (localTag.updatedAt < serverTag.updatedAt) {
        toUpdate.push(
          localTag.prepareUpdate((tag) => Object.assign(tag, serverTag))
        )
      }
    } else {
      toCreate.push(
        tagsCollection.prepareCreate((tag) => Object.assign(tag, serverTag))
      )
    }
  }

  // Push
  const tagsToPush = (await tagsChangedLocally.fetch()).filter((tag) => {
    if (!tag._id) {
      return true
    }
    const serverTag = serverTagsMap[tag._id]
    if (serverTag) {
      return tag.updatedAt > serverTag.updatedAt
    } else {
      return true
    }
  })
  if (!tagsToPush.length) {
    // Complete sync
    await database.write(
      async () => await database.batch(...toUpdate, ...toCreate)
    )
    completeSync()
    return
  }
  const savedPushedTags = await pushBack(
    tagsToPush.map((v) => ({ ...cloneTag(v) })) as any
  )
  // Modify dates
  savedPushedTags.forEach((tag) => {
    tag.updatedAt = new Date(tag.updatedAt)
    tag.createdAt = new Date(tag.createdAt)
  })
  for (const tag of savedPushedTags) {
    if (!tag._tempSyncId) {
      continue
    }
    const localTag = await getTagById(tag._tempSyncId)
    if (localTag) {
      toUpdate.push(
        localTag.prepareUpdate((tagToUpdate) => Object.assign(tagToUpdate, tag))
      )
    }
  }
  await database.write(
    async () => await database.batch(...toUpdate, ...toCreate)
  )
  // Complete sync
  completeSync()
}

export async function onTodosObjectsFromServer(
  todosChangedOnServer: MelonTodo[],
  pushBack: (objects: MelonTodo[]) => Promise<MelonTodo[]>,
  completeSync: () => void
) {
  // Modify dates
  todosChangedOnServer.forEach((todo) => {
    todo.updatedAt = new Date(todo.updatedAt)
    todo.createdAt = new Date(todo.createdAt)
  })
  // Get variables
  const serverTodosMap = todosChangedOnServer.reduce((p, c) => {
    if (c._id) {
      p[c._id] = c
    }
    return p
  }, {} as { [index: string]: MelonTodo })
  const lastSyncDate = sharedTodoStore.updatedAt
  const todosChangedLocally = lastSyncDate
    ? todosCollection.query(
        Q.where(TodoColumn.updatedAt, Q.gt(lastSyncDate.getTime()))
      )
    : todosCollection.query()
  const toUpdate = [] as MelonTodo[]
  const toCreate = [] as MelonTodo[]
  // Pull
  for (const serverTodo of todosChangedOnServer) {
    if (!serverTodo._id) {
      continue
    }
    let localTodo = await getTodoById(serverTodo._id)
    if (localTodo) {
      if (localTodo.updatedAt < serverTodo.updatedAt) {
        toUpdate.push(
          localTodo.prepareUpdate((todo) => {
            Object.assign(todo, omit(serverTodo, 'user', 'delegator'))
            if (todo.encrypted) {
              todo.text = decrypt(todo.text)
            }
            todo._exactDate = serverTodo.monthAndYear
              ? new Date(getTitle(serverTodo))
              : new Date()
          })
        )
      }
    } else {
      const newTodo = {
        ...serverTodo,
        _exactDate: serverTodo.monthAndYear
          ? new Date(getTitle(serverTodo))
          : new Date(),
      }
      if (newTodo.encrypted) {
        newTodo.text = decrypt(newTodo.text)
      }

      let user: MelonUser | undefined
      let delegator: MelonUser | undefined
      if (newTodo.user && newTodo.delegator) {
        user = newTodo.user
          ? await updateOrCreateDelegation(newTodo.user, false, true)
          : undefined
        delegator = newTodo.delegator
          ? await updateOrCreateDelegation(newTodo.delegator, true, true)
          : undefined
      }
      toCreate.push(
        todosCollection.prepareCreate((todo) => {
          Object.assign(todo, omit(newTodo, 'user', 'delegator'))
          if (user && delegator) {
            todo.user?.set(user)
            todo.delegator?.set(delegator)
          }
        })
      )
    }
  }

  // Push
  const todosToPush = (await todosChangedLocally.fetch()).filter((todo) => {
    if (!todo._id) {
      return true
    }
    const serverTodo = serverTodosMap[todo._id]
    if (serverTodo) {
      return todo.updatedAt > serverTodo.updatedAt
    } else {
      return true
    }
  })
  if (!todosToPush.length) {
    await database.write(async () => {
      await database.batch(...toUpdate, ...toCreate)
    })
    // Complete sync
    completeSync()
    refreshWidgetAndBadgeAndWatch()
    return
  }
  const savedPushedTodos = await pushBack(
    todosToPush
      .map((v) => ({ ...cloneTodo(v) }))
      .map((v) => {
        if (v.encrypted) {
          v.text = encrypt(v.text)
        }
        return v
      }) as any
  )
  // Modify dates
  savedPushedTodos.forEach((todo) => {
    todo.updatedAt = new Date(todo.updatedAt)
    todo.createdAt = new Date(todo.createdAt)
  })
  for (const serverTodo of savedPushedTodos) {
    if (!serverTodo._tempSyncId) {
      continue
    }
    const localTodo = await getTodoById(serverTodo._tempSyncId)
    if (localTodo) {
      toUpdate.push(
        localTodo.prepareUpdate((todo) => {
          if (serverTodo.encrypted) {
            serverTodo.text = decrypt(serverTodo.text)
          }
          serverTodo._exactDate = serverTodo.monthAndYear
            ? new Date(getTitle(serverTodo))
            : new Date()
          Object.assign(
            todo,
            omit(serverTodo, 'user', 'delegator', '_tempSyncId')
          )
        })
      )
    }
  }

  await database.write(async () => {
    await database.batch(...toUpdate, ...toCreate)
  })
  // Complete sync
  completeSync()
  refreshWidgetAndBadgeAndWatch()
}
