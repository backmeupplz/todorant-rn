import { Q } from '@nozbe/watermelondb'
import { sharedTodoStore } from '@stores/TodoStore'
import { computed, makeObservable } from 'mobx'

export class CurrentVM {
  currentTodo = sharedTodoStore.todayUncompletedTodos.extend(
    Q.experimentalTake(1)
  )
}
