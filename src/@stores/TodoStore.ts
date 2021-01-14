import { observableNow } from '@utils/ObservableNow'
import { cloneTodo, getTitle, Todo } from '@models/Todo'
import { sharedSettingsStore } from '@stores/SettingsStore'
import { decrypt, encrypt } from '@utils/encryption'
import { hydrate } from '@utils/hydration/hydrate'
import { hydrateStore } from '@utils/hydration/hydrateStore'
import { mobxRealmCollection } from '@utils/mobx-realm/collection'
import { realm } from '@utils/realm'
import { realmTimestampFromDate } from '@utils/realmTimestampFromDate'
import { refreshWidgetAndBadge } from '@utils/refreshWidgetAndBadge'
import { computed, makeObservable, observable } from 'mobx'
import { persist } from 'mobx-persist'
import uuid from 'uuid'

class TodoStore {
  @persist('date') @observable lastSyncDate?: Date

  hydrated = false

  @computed get todayUncompletedTodos() {
    const title = observableNow.todayTitle
    return mobxRealmCollection(this.getRealmTodos(title, false))
  }

  @computed get todayCompletedTodos() {
    const title = observableNow.todayTitle
    return mobxRealmCollection(this.getRealmTodos(title, true))
  }

  getRealmTodos(title: string, completed: boolean) {
    return realm
      .objects(Todo)
      .filtered('deleted = false')
      .filtered('delegateAccepted != false')
      .filtered(`completed = ${completed ? 'true' : 'false'}`)
      .filtered(
        title.length === 10
          ? `monthAndYear = "${title.substr(0, 7)}" && date = "${title.substr(
              8,
              2
            )}"`
          : `monthAndYear = "${title.substr(
              0,
              7
            )}" && (date == "" || date == null)`
      )
      .sorted([
        ['frog', true],
        ['order', false],
      ])
  }

  todosForDate = (title: string) => {
    return realm
      .objects(Todo)
      .filtered('deleted = false')
      .filtered('delegateAccepted != false')
      .filtered(
        title.length === 10
          ? `monthAndYear = "${title.substr(0, 7)}" && date = "${title.substr(
              8,
              2
            )}"`
          : `monthAndYear = "${title.substr(
              0,
              7
            )}" && (date == "" || date == null)`
      )
      .sorted('order')
  }

  todosBeforeDate = (title: string) => {
    const todayWithTimezoneOffset = new Date(title)
    const todayString = `T${
      Math.floor(todayWithTimezoneOffset.getTime() / 1000) - 1
    }:000`
    return realm
      .objects(Todo)
      .filtered(
        `deleted = false && completed = false && _exactDate < ${todayString} && delegateAccepted != false`
      )
  }

  @computed get currentTodo() {
    return this.todayUncompletedTodos.length
      ? this.todayUncompletedTodos[0]
      : undefined
  }

  @computed get unacceptedTodos() {
    return realm
      .objects(Todo)
      .filtered('deleted = false')
      .filtered('delegateAccepted = false')
  }

  @computed get progress() {
    return {
      count:
        this.todayUncompletedTodos.length + this.todayCompletedTodos.length,
      completed: this.todayCompletedTodos.length,
    }
  }

  @computed get isPlanningRequired() {
    const title = observableNow.todayTitle
    const oldTodos = mobxRealmCollection(this.todosBeforeDate(title))
    return !!oldTodos.length
  }

  constructor() {
    makeObservable(this)
    this.refreshTodos()
  }

  logout = () => {
    this.lastSyncDate = undefined
    this.refreshTodos()
  }

  onObjectsFromServer = async (
    todosChangedOnServer: Todo[],
    pushBack: (objects: Todo[]) => Promise<Todo[]>,
    completeSync: () => void
  ) => {
    if (!this.hydrated) {
      throw new Error("Store didn't hydrate yet")
    }
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
    const todosChangedLocally = this.lastSyncDate
      ? realm
          .objects(Todo)
          .filtered(`updatedAt > ${realmTimestampFromDate(this.lastSyncDate)}`)
      : realm.objects(Todo)
    // Pull
    realm.write(() => {
      for (const serverTodo of todosChangedOnServer) {
        if (!serverTodo._id) {
          continue
        }
        let localTodo = this.getTodoById(serverTodo._id)
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
      this.refreshTodos()
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
        const localTodo = this.getTodoById(todo._tempSyncId)
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
    this.refreshTodos()
  }

  refreshTodos = () => {
    refreshWidgetAndBadge()
  }

  recalculateExactDates() {
    const todos = realm.objects(Todo)
    realm.write(() => {
      for (const todo of todos) {
        todo._exactDate = new Date(getTitle(todo))
      }
    })
  }

  private getTodoById = (id?: string) => {
    if (!id) {
      return undefined
    }
    const todos = realm
      .objects(Todo)
      .filtered(`_id = "${id}" || _tempSyncId = "${id}"`)
    return todos.length ? todos[0] : undefined
  }
}

export const sharedTodoStore = new TodoStore()
hydrate('TodoStore', sharedTodoStore).then(() => {
  sharedTodoStore.hydrated = true
  hydrateStore('TodoStore')
})
