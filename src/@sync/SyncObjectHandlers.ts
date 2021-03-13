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

export async function onDelegationObjectsFromServer(
  objects: any,
  completeSync: () => void
) {
  // Remove all
  realm.write(() => {
    realm.delete(realm.objects<DelegationUser>('DelegationUser'))
  })
  // Sync delegates
  realm.write(() => {
    for (const delegate of objects.delegates) {
      realm.create('DelegationUser', {
        ...delegate,
        delegationType: DelegationUserType.delegate,
      })
    }
  })
  // Sync delegators
  realm.write(() => {
    for (const delegator of objects.delegators) {
      realm.create('DelegationUser', {
        ...delegator,
        delegationType: DelegationUserType.delegator,
      })
    }
  })
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
  const allTags = realm.objects<Tag>('Tag')
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
        realm.create('Tag', newTag)
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
    if ((todo as any).delegator && (todo as any).delegator.name) {
      todo.delegateAccepted = !!todo.delegateAccepted
      todo.delegatorName = (todo as any).delegator.name
    }
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
  // Complete sync
  completeSync()
  refreshWidgetAndBadgeAndWatch()
}
