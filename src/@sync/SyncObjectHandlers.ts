import { sharedTagStore } from '@stores/TagStore'
import { sharedTodoStore } from '@stores/TodoStore'
import { realmTimestampFromDate } from '@utils/realmTimestampFromDate'
import { Tag, cloneTag } from '@models/Tag'
import { getTagById } from '@utils/getTagById'
import { DelegationUser, DelegationUserType } from '@models/DelegationUser'
import { realm } from '@utils/realm'
import uuid from 'uuid'
import { cloneTodo, getTitle, Todo } from '@models/Todo'
import { getTodoById } from '@utils/getTodoById'
import { decrypt, encrypt } from '@utils/encryption'
import {
  observableNowEventEmitter,
  ObservableNowEventEmitterEvent,
} from '@utils/ObservableNow'
import { refreshWidgetAndBadgeAndWatch } from '@utils/refreshWidgetAndBadgeAndWatch'
import { sharedDelegationStore } from '@stores/DelegationStore'
import {
  cloneDelegation,
  removeDelegation,
  removeMismatchesWithServer,
  updateOrCreateDelegation,
} from '@utils/delegations'
import { database, tagsCollection, todosCollection } from '@utils/wmdb'
import { Q } from '@nozbe/watermelondb'
import { MelonTodo } from '@models/MelonTodo'
import { omit } from 'lodash'
import { MelonTag } from '@models/MelonTag'
import { TagColumn, TodoColumn } from '@utils/melondb'

export async function onDelegationObjectsFromServer(
  objects: {
    delegators: DelegationUser[]
    delegates: DelegationUser[]
    delegateUpdated: boolean
  },
  pushBack: (objects: {
    delegators: DelegationUser[]
    delegates: DelegationUser[]
  }) => Promise<{
    delegators: (DelegationUser & { invalid?: boolean })[]
    delegates: DelegationUser[]
  }>,
  completeSync: () => void
) {
  const lastSyncDate = sharedDelegationStore.updatedAt
  // Get local delegators
  const realmDelegators = realm
    .objects(DelegationUser)
    .filtered('isDelegator = true')
  // Get local delegates
  const realmDelegates = realm
    .objects(DelegationUser)
    .filtered('isDelegator != true')
  // Filter delegators that changed locally
  const delegatorsChangedLocally = lastSyncDate
    ? realmDelegators.filtered(
        `updatedAt > ${realmTimestampFromDate(lastSyncDate)}`
      )
    : realmDelegators
  // Filter delegates that changed locally
  const delegatesChangedLocally = lastSyncDate
    ? realmDelegates.filtered(
        `updatedAt > ${realmTimestampFromDate(lastSyncDate)}`
      )
    : realmDelegates
  // Pull
  // Create and delete delegates and delegators
  realm.write(() => {
    // Delegators
    // Check if delegators list changed on server
    if (objects.delegateUpdated) {
      // If so then remove that delegates which exists locally but not on server
      removeMismatchesWithServer(realmDelegators, objects.delegators)
    }
    // Create new or just update existing delegators
    objects.delegators.forEach((delegator) => {
      updateOrCreateDelegation(delegator, true)
    })
    // Delegates
    // Check if delegates list changed on server
    if (objects.delegateUpdated) {
      // If so then remove that delegates which exists locally but not on server
      removeMismatchesWithServer(realmDelegates, objects.delegates)
    }
    // Create new or just update existing delegates
    objects.delegates.forEach((delegate) => {
      updateOrCreateDelegation(delegate, false)
    })
  })
  // Push
  // Get delegators which should be removed
  const delegatorsToDelete = delegatorsChangedLocally.filter(
    (delegator) => delegator.deleted
  )
  // Get delegates without data (they were accepted offline or didnt load data properly when accepted)
  const delegatorsWithoutData = delegatorsChangedLocally.filter(
    (delegator) => !delegator._id
  )
  // Get delegators which should be pushed on server
  const delegatorsToPush = [...delegatorsWithoutData, ...delegatorsToDelete]
  // Get delegates which should be removed
  const delegatesToDelete = delegatesChangedLocally.filter(
    (delegate) => delegate.deleted
  )
  // If there's no data that should be pushed on server that just completeSync
  if (!delegatorsToPush.length && !delegatesChangedLocally.length) {
    // Complete sync
    completeSync()
    observableNowEventEmitter.emit(
      ObservableNowEventEmitterEvent.ObservableNowChanged
    )
    return
  }
  // Push data on server
  const savedPushedDelegations = await pushBack({
    delegates: delegatesChangedLocally.map((delegate) =>
      cloneDelegation(delegate)
    ),
    delegators: delegatorsToPush.map((delegator) => cloneDelegation(delegator)),
  })
  realm.write(() => {
    // Delete after after sync
    delegatorsToDelete.forEach((delegator) => {
      removeDelegation(delegator, true)
    })
    delegatesToDelete.forEach((delegate) => {
      removeDelegation(delegate, false)
    })
    // Fill delegations with missing info
    savedPushedDelegations.delegators.forEach((delegator) => {
      if (delegator.invalid) {
        removeDelegation(delegator, true)
        return
      }
      updateOrCreateDelegation(delegator, true)
    })
    savedPushedDelegations.delegates.forEach((delegate) => {
      updateOrCreateDelegation(delegate, false)
    })
  })
  observableNowEventEmitter.emit(
    ObservableNowEventEmitterEvent.ObservableNowChanged
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
  realm.write(() => {
    for (const tag of savedPushedTags) {
      if (!tag._tempSyncId) {
        continue
      }
      const localTag = getTagById(tag._tempSyncId)
      if (localTag) {
        Object.assign(localTag, tag)
      }
    }
  })
  // Complete sync
  console.log(
    'ыыыыыыыыыыыыыыыыыыыыыыыыыыыыыыыыыыыыыыыыыыыыыыыыыыыыыыыыыыыыыыыыыыыыыыыыыыыыыы'
  )
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
      toCreate.push(
        todosCollection.prepareCreate((todo) =>
          Object.assign(todo, omit(newTodo, 'user', 'delegator'))
        )
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
    observableNowEventEmitter.emit(
      ObservableNowEventEmitterEvent.ObservableNowChanged
    )
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
  console.log(savedPushedTodos)
  // Modify dates
  savedPushedTodos.forEach((todo) => {
    todo.updatedAt = new Date(todo.updatedAt)
    todo.createdAt = new Date(todo.createdAt)
  })
  for (const todo of savedPushedTodos) {
    if (!todo._tempSyncId) {
      continue
    }
    const localTodo = await getTodoById(todo._tempSyncId)
    if (localTodo) {
      Object.assign(localTodo, todo)
      if (localTodo.encrypted) {
        localTodo.text = decrypt(localTodo.text)
      }
      localTodo._exactDate = localTodo.monthAndYear
        ? new Date(getTitle(localTodo))
        : new Date()
      toUpdate.push(
        localTodo.prepareUpdate((todo) =>
          Object.assign(todo, omit(localTodo, 'user', 'delegator'))
        )
      )
    }
  }

  await database.write(async () => {
    await database.batch(...toUpdate, ...toCreate)
  })
  observableNowEventEmitter.emit(
    ObservableNowEventEmitterEvent.ObservableNowChanged
  )
  // Complete sync
  completeSync()
  refreshWidgetAndBadgeAndWatch()
}
