import { Q } from '@nozbe/watermelondb'
import { computed, makeObservable, observable } from 'mobx'
import { sharedTodoStore } from '@stores/TodoStore'

export class CurrentVM {
  @observable currentTodo = sharedTodoStore.todayUncompletedTodos?.extend(
    Q.take(1)
  )

  constructor() {
    makeObservable(this)
  }
}
