import { observable } from 'mobx'
import { Todo } from 'src/@models/Todo'

class TodoStore {
  @observable todos?: Todo[]
}

export const sharedTodoStore = new TodoStore()
