import { sharedTodoStore } from '@stores/TodoStore'
import { computed, makeObservable } from 'mobx'

export class CurrentVM {
  constructor() {
    makeObservable(this)
  }

  @computed get currentTodo() {
    return sharedTodoStore.currentTodo
  }
}
