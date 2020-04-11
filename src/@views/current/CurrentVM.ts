import { sharedTodoStore } from '@stores/TodoStore'
import { computed } from 'mobx'

export class CurrentVM {
  @computed get currentTodo() {
    return sharedTodoStore.currentTodo
  }
}
