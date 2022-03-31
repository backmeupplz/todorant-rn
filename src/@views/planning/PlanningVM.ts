import { Q } from '@nozbe/watermelondb'
import { TodoColumn } from '@utils/watermelondb/tables'
import { debounce } from 'lodash'
import { sharedAppStateStore } from '@stores/AppStateStore'
import { sharedSessionStore } from '@stores/SessionStore'
import { sharedTodoStore } from '@stores/TodoStore'

export class PlanningVM {
  uncompletedTodosData = this.getTodos(false)
  completedTodosData = this.getTodos(true)

  draggingEdit = false

  arrOfDraggedTodos = {} as {
    [index: string]: boolean
  }

  getTodos(completed: boolean) {
    return sharedTodoStore.undeletedTodos.extend(
      Q.where(TodoColumn.completed, completed),
      Q.or(
        Q.where(TodoColumn.user, null),
        Q.where(TodoColumn.user, sharedTodoStore.wmdbUserId || null),
        Q.where(TodoColumn.user, sharedSessionStore.user?._id || null)
      ),
      Q.or(
        Q.where(TodoColumn.delegator, null),
        Q.where(TodoColumn.delegateAccepted, true)
      ),
      Q.sortBy(TodoColumn._exactDate, completed ? Q.desc : Q.asc),
      Q.sortBy(TodoColumn.frog, Q.desc),
      Q.sortBy(TodoColumn.order, Q.asc)
    )
  }

  setCoordinates = debounce(
    (yAx: number, xAx: number) => {
      sharedAppStateStore.activeCoordinates = { x: xAx, y: yAx }
    },
    1000,
    { maxWait: 250 }
  )
}
