import { cloneTodo, getTitle, Todo } from '@models/Todo'
import { sharedSettingsStore } from '@stores/SettingsStore'
import { decrypt, encrypt } from '@utils/encryption'
import { hydrate } from '@utils/hydrate'
import { hydrateStore } from '@utils/hydrated'
import { mobxRealmCollection } from '@utils/mobx-realm/collection'
import { realm } from '@utils/realm'
import { realmTimestampFromDate } from '@utils/realmTimestampFromDate'
import { refreshWidgetAndBadge } from '@utils/refreshWidgetAndBadge'
import { getDateString } from '@utils/time'
import { computed, observable } from 'mobx'
import { persist } from 'mobx-persist'
import uuid from 'uuid'

class TodoStore {
  @persist('date') @observable lastSyncDate?: Date

  hydrated = false

  @observable allTodos = realm.objects(Todo)

  @persist recalculatedExactDates = false

  @observable todayUncompletedTodos = mobxRealmCollection(
    this.getObservableTodayUncompletedTodos()
  )
  // todayUncompletedTodos = this.getObservableTodayUncompletedTodos()

  getObservableTodayUncompletedTodos() {
    const title = getDateString(new Date())
    return realm
      .objects(Todo)
      .filtered('deleted = false')
      .filtered('delegateAccepted != false')
      .filtered('completed = false')
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

  todosForDate = (title: string) => {
    return this.allTodos
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

  @computed get currentTodo() {
    return this.todayUncompletedTodos.length
      ? this.todayUncompletedTodos[0]
      : undefined
  }

  @computed get unacceptedTodos() {
    return this.allTodos
      .filtered('deleted = false')
      .filtered('delegateAccepted = false')
  }

  @computed get progress() {
    return {
      count: this.todayUncompletedTodos.length,
      completed: 0,
    }
  }

  @computed get isPlanningRequired() {
    const todayWithTimezoneOffset = new Date()
    todayWithTimezoneOffset.setMinutes(
      todayWithTimezoneOffset.getMinutes() -
        todayWithTimezoneOffset.getTimezoneOffset()
    )

    const startTimeOfDay = sharedSettingsStore.startTimeOfDaySafe
    const todayDate = new Date()
    todayDate.setHours(parseInt(startTimeOfDay.substr(0, 2)))
    todayDate.setMinutes(
      parseInt(startTimeOfDay.substr(3)) - todayDate.getTimezoneOffset()
    )
    if (todayWithTimezoneOffset < todayDate) {
      todayWithTimezoneOffset.setDate(todayWithTimezoneOffset.getDate() - 1)
    }

    const todayString = `T${
      Math.floor(todayWithTimezoneOffset.getTime() / 1000) -
      (Math.floor(todayWithTimezoneOffset.getTime() / 1000) % (24 * 60 * 60)) -
      1
    }:000`
    const todos = this.allTodos.filtered(
      `deleted = false && completed = false && _exactDate < ${todayString} && delegateAccepted != false`
    )
    return !!todos.length
  }

  constructor() {
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
      ? this.allTodos.filtered(
          `updatedAt > ${realmTimestampFromDate(this.lastSyncDate)}`
        )
      : this.allTodos
    // Pull
    for (const serverTodo of todosChangedOnServer) {
      if (!serverTodo._id) {
        continue
      }
      let localTodo = this.getTodoById(serverTodo._id)
      if (localTodo) {
        if (localTodo.updatedAt < serverTodo.updatedAt) {
          realm.write(() => {
            if (localTodo) {
              Object.assign(localTodo, serverTodo)
              if (localTodo.encrypted) {
                localTodo.text = decrypt(localTodo.text)
              }
              localTodo._exactDate = localTodo.monthAndYear
                ? new Date(getTitle(localTodo))
                : new Date()
            }
          })
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
        realm.write(() => {
          realm.create(Todo, newTodo as Todo)
        })
      }
    }
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
    // this.allTodos = realm.objects(Todo)
    refreshWidgetAndBadge()
  }

  recalculateExactDatesIfNeeded() {
    if (!this.recalculatedExactDates) {
      this.recalculateExactDates()
    }
    this.recalculatedExactDates = true
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
    const todos = this.allTodos.filtered(
      `_id = "${id}" || _tempSyncId = "${id}"`
    )
    return todos.length ? todos[0] : undefined
  }
}

export const sharedTodoStore = new TodoStore()
hydrate('TodoStore', sharedTodoStore).then(() => {
  sharedTodoStore.hydrated = true
  sharedTodoStore.recalculateExactDatesIfNeeded()
  hydrateStore('TodoStore')
})
