import { observable, computed } from 'mobx'
import { Todo, compareTodos, isTodoOld } from '@models/Todo'
import { create, persist } from 'mobx-persist'
import { AsyncStorage } from 'react-native'
import uuid from 'uuid'
import { getDateDateString, getDateMonthAndYearString } from '@utils/time'
import { hydrateStore } from '@utils/hydrated'

const hydrate = create({
  storage: AsyncStorage,
})

class TodoStore {
  @persist('list', Todo) @observable todos: Todo[] = []
  @persist('date' as any) @observable lastSyncDate?: Date

  hydrated = false

  @computed get undeletedTodos() {
    return this.todos.filter(t => !t.deleted)
  }

  @computed get todayTodos() {
    const today = new Date()
    return this.todosForDate(today)
  }

  todosForDate = (date: Date) => {
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
    return this.todayTodos.filter(t => !t.completed).length
      ? this.todayTodos[0]
      : undefined
  }

  @computed get propress() {
    return {
      count: this.todayTodos.length,
      completed: this.todayTodos.filter(t => t.completed).length,
    }
  }

  @computed get isPlanningRequired() {
    return this.undeletedTodos
      .filter(t => !t.completed)
      .reduce((prev, cur) => {
        return isTodoOld(cur) ? true : prev
      }, false)
  }

  logout = () => {
    this.todos = []
    this.lastSyncDate = undefined
  }

  onObjectsFromServer = async (
    todosChangedOnServer: Todo[],
    pushBack: (objects: Todo[]) => Promise<Todo[]>
  ) => {
    if (!this.hydrated) {
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
    const savedPushedTodos = await pushBack(todosToPush)
    for (const todo of savedPushedTodos) {
      if (!todo._tempSyncId) {
        continue
      }
      Object.assign(todosToPushMap[todo._tempSyncId], todo)
    }
    // Set result
    this.todos = result
  }

  modify = (...todos: Todo[]) => {
    for (const todo of todos) {
      const t = this.getTodoById(todo._id || todo._tempSyncId)
      if (!t) {
        return
      }
      Object.assign(t, todo)
      t.updatedAt = new Date()
    }
  }

  private getTodoById = (id?: string) => {
    return !id
      ? undefined
      : this.todos.find(todo => todo._id === id || todo._tempSyncId === id)
  }
}

export const sharedTodoStore = new TodoStore()
hydrate('TodoStore', sharedTodoStore).then(() => {
  sharedTodoStore.hydrated = true
  hydrateStore('TodoStore')
})
