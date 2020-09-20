import { syncEventEmitter } from '@utils/sockets'
import { realm } from '@utils/realm'
import { observable, computed } from 'mobx'
import { Todo, getTitle, compareTodos } from '@models/Todo'
import { persist } from 'mobx-persist'
import uuid from 'uuid'
import { getDateString } from '@utils/time'
import { hydrateStore } from '@utils/hydrated'
import { hydrate } from '@utils/hydrate'
import { decrypt, encrypt } from '@utils/encryption'
import { realmTimestampFromDate } from '@utils/realmTimestampFromDate'
import { sharedSettingsStore } from '@stores/SettingsStore'
import TodorantWidget from 'react-native-todorant-widget'
import { Platform } from 'react-native'

class TodoStore {
  @persist('date') @observable lastSyncDate?: Date

  hydrated = false

  @observable allTodos = realm.objects<Todo>('Todo')

  @persist recalculatedExactDates = false

  @computed get todayTodos() {
    const now = new Date()
    const today = new Date()
    const startTimeOfDay = sharedSettingsStore.startTimeOfDaySafe
    today.setHours(parseInt(startTimeOfDay.substr(0, 2)))
    today.setMinutes(parseInt(startTimeOfDay.substr(3)))

    if (now < today) {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      return this.todosForDate(getDateString(yesterday))
    } else {
      return this.todosForDate(getDateString(now))
    }
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
    const todayTodos = Array.from(
      this.todayTodos.filtered('completed = false')
    ).sort(compareTodos(false))
    return todayTodos.length ? todayTodos[0] : undefined
  }

  @computed get unacceptedTodos() {
    return this.allTodos
      .filtered('deleted = false')
      .filtered('delegateAccepted = false')
  }

  @computed get progress() {
    return {
      count: this.todayTodos.length,
      completed: this.todayTodos.filtered('completed = true').length,
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
    pushBack: (objects: Todo[]) => Promise<Todo[]>
  ) => {
    if (!this.hydrated) {
      return
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
              localTodo._exactDate = new Date(getTitle(localTodo))
            }
          })
        }
      } else {
        const newTodo = {
          ...serverTodo,
          _exactDate: new Date(getTitle(serverTodo)),
        }
        if (newTodo.encrypted) {
          newTodo.text = decrypt(newTodo.text)
        }
        realm.write(() => {
          realm.create('Todo', newTodo)
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
      sharedTodoStore.lastSyncDate = new Date()
      // Refresh
      this.refreshTodos()
      syncEventEmitter.emit(`todos_synced`)
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
        .map((v) => ({ ...v }))
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
          localTodo._exactDate = new Date(getTitle(localTodo))
        }
      }
    })
    // Refresh
    this.refreshTodos()
  }

  refreshTodos = () => {
    this.allTodos = realm.objects<Todo>('Todo')
    if (Platform.OS === 'android') {
      TodorantWidget.forceUpdateAll()
    }
  }

  recalculateExactDatesIfNeeded() {
    if (!this.recalculatedExactDates) {
      this.recalculateExactDates()
    }
    this.recalculatedExactDates = true
  }

  recalculateExactDates() {
    const todos = realm.objects<Todo>('Todo')
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
