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
  tagsChangedOnServer: Tag[],
  pushBack: (objects: Tag[]) => Promise<Tag[]>,
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
  }, {} as { [index: string]: Tag })
  const allTags = realm.objects(Tag)
  const lastSyncDate = sharedTagStore.updatedAt
  const tagsChangedLocally = lastSyncDate
    ? allTags.filtered(`updatedAt > ${realmTimestampFromDate(lastSyncDate)}`)
    : allTags
  // Pull
  realm.write(() => {
    for (const serverTag of tagsChangedOnServer) {
      if (!serverTag._id) {
        continue
      }
      let localTag = getTagById(serverTag._id)
      if (localTag) {
        if (localTag.updatedAt < serverTag.updatedAt) {
          if (localTag) {
            Object.assign(localTag, serverTag)
          }
        }
      } else {
        const newTag = {
          ...serverTag,
        }
        realm.create(Tag, newTag as Tag)
      }
    }
  })
  // Push
  const tagsToPush = tagsChangedLocally.filter((tag) => {
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
    completeSync()
    return
  }
  realm.write(() => {
    for (const tagToPush of tagsToPush) {
      if (!tagToPush._tempSyncId) {
        tagToPush._tempSyncId = uuid()
      }
    }
  })
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
  completeSync()
}

export async function onTodosObjectsFromServer(
  todosChangedOnServer: Todo[],
  pushBack: (objects: Todo[]) => Promise<Todo[]>,
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
  }, {} as { [index: string]: Todo })
  const lastSyncDate = sharedTodoStore.updatedAt
  const todosChangedLocally = lastSyncDate
    ? realm
        .objects(Todo)
        .filtered(`updatedAt > ${realmTimestampFromDate(lastSyncDate)}`)
    : realm.objects(Todo)
  // Pull
  realm.write(() => {
    for (const serverTodo of todosChangedOnServer) {
      if (!serverTodo._id) {
        continue
      }
      let localTodo = getTodoById(serverTodo._id)
      if (localTodo) {
        if (localTodo.updatedAt < serverTodo.updatedAt) {
          if (localTodo) {
            Object.assign(localTodo, serverTodo)
            if (localTodo.encrypted) {
              localTodo.text = decrypt(localTodo.text)
            }
            localTodo._exactDate = localTodo.monthAndYear
              ? new Date(getTitle(localTodo))
              : new Date()
          }
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
        realm.create(Todo, newTodo as Todo)
      }
    }
  })
  // Push
  const todosToPush = todosChangedLocally.filter((todo) => {
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
    // Complete sync
    completeSync()
    refreshWidgetAndBadgeAndWatch()
    observableNowEventEmitter.emit(
      ObservableNowEventEmitterEvent.ObservableNowChanged
    )
    return
  }
  realm.write(() => {
    for (const todoToPush of todosToPush) {
      if (!todoToPush._tempSyncId) {
        todoToPush._tempSyncId = uuid()
      }
    }
  })
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
  realm.write(() => {
    for (const todo of savedPushedTodos) {
      if (!todo._tempSyncId) {
        continue
      }
      const localTodo = getTodoById(todo._tempSyncId)
      if (localTodo) {
        Object.assign(localTodo, todo)
        if (localTodo.encrypted) {
          localTodo.text = decrypt(localTodo.text)
        }
        localTodo._exactDate = localTodo.monthAndYear
          ? new Date(getTitle(localTodo))
          : new Date()
      }
    }
  })
  observableNowEventEmitter.emit(
    ObservableNowEventEmitterEvent.ObservableNowChanged
  )
  // Complete sync
  completeSync()
  refreshWidgetAndBadgeAndWatch()
}
