import { Q } from '@nozbe/watermelondb'
import { sharedTodoStore } from '@stores/TodoStore'
import { computed, makeObservable, observable } from 'mobx'

export class CurrentVM {
  @observable currentTodo = sharedTodoStore.todayUncompletedTodos?.extend(
    Q.take(1)
  )

  constructor() {
    makeObservable(this)
  }
}
