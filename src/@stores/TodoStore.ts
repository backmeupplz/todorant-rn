import { sockets } from '@utils/sockets'
import { observable, computed } from 'mobx'
import { Todo, compareTodos } from '@models/Todo'
import { create, persist } from 'mobx-persist'
import { AsyncStorage } from 'react-native'
import uuid from 'uuid'
import { getDateDateString, getDateMonthAndYearString } from '@utils/time'

const hydrate = create({
  storage: AsyncStorage,
})

let hydrated = false

class TodoStore {
  @persist('list', Todo) @observable todos: Todo[] = []
  @persist('date' as any) @observable lastSyncDate?: Date

  @computed get undeletedTodos() {
    return this.todos.filter(t => !t.deleted)
  }

  @computed get todayTodos() {
    const today = new Date()
    return this.todosForDate(today)
  }

  todosForDate(date: Date) {
    return this.undeletedTodos
      .filter(
        todo =>
          todo.date &&
          todo.date === getDateDateString(date) &&
          todo.monthAndYear === getDateMonthAndYearString(date)
      )
      .sort(compareTodos(false))
  }

  @computed get currentTodo() {
    return this.todayTodos.length ? this.todayTodos[0] : undefined
  }

  logout() {
    this.todos = []
    this.lastSyncDate = undefined
  }

  onTodos = async (todosChangedOnServer: Todo[]) => {
    if (!hydrated) {
      return
    }
    // Create resulting array
    const result: Todo[] = [...this.todos]
    // Get variables
    const localTodosMap = result.reduce((p, c) => {
      if (c._id) {
        p[c._id] = c
      }
      return p
    }, {} as { [index: string]: Todo })
    const serverTodosMap = todosChangedOnServer.reduce((p, c) => {
      if (c._id) {
        p[c._id] = c
      }
      return p
    }, {} as { [index: string]: Todo })
    const todosChangedLocally = result.filter(
      todo => !this.lastSyncDate || todo.updatedAt > this.lastSyncDate
    )
    // Pull
    for (const serverTodo of todosChangedOnServer) {
      let localTodo = serverTodo._id ? localTodosMap[serverTodo._id] : undefined
      if (localTodo) {
        if (localTodo.updatedAt < serverTodo.updatedAt) {
          Object.assign(localTodo, serverTodo)
        }
      } else {
        result.unshift(serverTodo)
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
    const todosToPushMap = {} as { [index: string]: Todo }
    todosToPush.forEach(todo => {
      todo._tempSyncId = uuid()
      todosToPushMap[todo._tempSyncId] = todo
    })
    const savedPushedTodos = await sockets.pushTodos(todosToPush)
    for (const todo of savedPushedTodos) {
      if (!todo._tempSyncId) {
        continue
      }
      Object.assign(todosToPushMap[todo._tempSyncId], todo)
    }
    // Set result
    this.todos = result
    // Finish
    this.lastSyncDate = new Date()
  }

  modify(...todos: Todo[]) {
    for (const todo of todos) {
      const t = this.getTodoById(todo._id || todo._tempSyncId)
      if (!t) {
        return
      }
      Object.assign(t, todo)
      t.updatedAt = new Date()
    }
  }

  private getTodoById(id?: string) {
    return !id
      ? undefined
      : this.todos.find(todo => todo._id === id || todo._tempSyncId === id)
  }
}

export const sharedTodoStore = new TodoStore()
hydrate('TodoStore', sharedTodoStore).then(() => {
  hydrated = true
  sockets.sync()
})
