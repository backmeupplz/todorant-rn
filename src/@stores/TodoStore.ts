import { realm } from './../@utils/realm'
import { observable, computed } from 'mobx'
import { Todo, getTitle } from '@models/Todo'
import { persist } from 'mobx-persist'
import uuid from 'uuid'
import { getDateString } from '@utils/time'
import { hydrateStore } from '@utils/hydrated'
import { hydrate } from '@utils/hydrate'
import moment from 'moment'

class TodoStore {
  @persist('date') @observable lastSyncDate?: Date

  hydrated = false

  @observable allTodos = realm.objects<Todo>(Todo)

  @computed get todayTodos() {
    const today = new Date()
    return this.todosForDate(today)
  }

  todosForDate = (date: Date) => {
    const title = getDateString(date)
    return this.allTodos
      .filtered(
        title.length === 10
          ? `deleted = false && monthAndYear = "${title.substr(
              0,
              7
            )}" && date = "${title.substr(8, 2)}"`
          : `deleted = false && monthAndYear = "${title.substr(0, 7)}" && !date`
      )
      .sorted('order')
  }

  @computed get currentTodo() {
    const todayTodos = this.todayTodos.filtered('completed = false')
    return todayTodos.length ? todayTodos[0] : undefined
  }

  @computed get progress() {
    return {
      count: this.todayTodos.length,
      completed: this.todayTodos.filtered('completed = true').length,
    }
  }

  @computed get isPlanningRequired() {
    const todayString = `T${Math.floor(new Date().getTime() / 1000) -
      (Math.floor(new Date().getTime() / 1000) % (24 * 60 * 60)) -
      1}:000`
    const todos = this.allTodos.filtered(
      `deleted = false && completed = false && _exactDate < ${todayString}`
    )
    return !!todos.length
  }

  constructor() {
    this.refreshTodos()
  }

  logout = () => {
    realm.write(() => {
      realm.deleteAll()
    })
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
    todosChangedOnServer.forEach(todo => {
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
            Object.assign(localTodo, serverTodo)
          })
        }
      } else {
        const newTodo = {
          ...serverTodo,
          _exactDate: new Date(getTitle(serverTodo)),
        }
        realm.write(() => {
          realm.create(Todo, newTodo)
        })
      }
    }
    // Push
    const todosToPush = todosChangedLocally.filter(todo => {
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
    realm.write(() => {
      for (const todoToPush of todosToPush) {
        if (!todoToPush._tempSyncId) {
          todoToPush._tempSyncId = uuid()
        }
      }
    })
    if (!todosToPush.length) {
      // Refresh
      this.refreshTodos()
      return
    }
    const savedPushedTodos = await pushBack(todosToPush.map(v => ({ ...v })))
    // Modify dates
    savedPushedTodos.forEach(todo => {
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
        }
      }
    })
    // Refresh
    this.refreshTodos()
  }

  refreshTodos = () => {
    this.allTodos = realm.objects<Todo>(Todo)
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

function realmTimestampFromDate(date: Date) {
  return `T${Math.floor(date.getTime() / 1000)}:000`
}

export const sharedTodoStore = new TodoStore()
hydrate('TodoStore', sharedTodoStore).then(() => {
  sharedTodoStore.hydrated = true
  hydrateStore('TodoStore')
})
