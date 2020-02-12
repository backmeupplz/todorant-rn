import { observable } from 'mobx'
import { Todo } from '@models/Todo'
import { create, persist } from 'mobx-persist'
import { AsyncStorage } from 'react-native'

const hydrate = create({
  storage: AsyncStorage,
})

class TodoStore {
  @persist('list', Todo) @observable todos: Todo[] = []

  addTodo(todo: Todo) {
    this.todos.unshift(todo)
  }

  getCurrent() {
    return this.todos.length ? this.todos[0] : undefined
  }
}

export const sharedTodoStore = new TodoStore()
hydrate('TodoStore', sharedTodoStore)
