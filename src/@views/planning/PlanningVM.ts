import { sharedAppStateStore } from '@stores/AppStateStore'
import { SyncRequestEvent } from '@sync/SyncRequestEvent'
import { EventEmitter } from 'events'
import { isTodoOld } from '@utils/isTodoOld'
import { debounce } from 'lodash'
import { todosCollection } from '@utils/wmdb'
import { Q } from '@nozbe/watermelondb'
import { TodoColumn } from '@utils/melondb'
import { sharedTodoStore } from '@stores/TodoStore'
import { sharedSessionStore } from '@stores/SessionStore'

export const planningEventEmitter = new EventEmitter()

export enum PlanningEventEmitter {
  ResolveHoverState = 'ResolveHoverState',
}

export class PlanningVM {
  uncompletedTodosData = this.getTodos(false)
  completedTodosData = this.getTodos(true)

  resetHoverState = () => {}

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
      Q.experimentalSortBy(TodoColumn._exactDate, completed ? Q.desc : Q.asc),
      Q.experimentalSortBy(TodoColumn.frog, Q.desc),
      Q.experimentalSortBy(TodoColumn.order, Q.asc)
    )
  }

  setCoordinates = debounce(
    (yAx: number, xAx: number) => {
      sharedAppStateStore.activeCoordinates = { x: xAx, y: yAx }
    },
    1000,
    { maxWait: 250 }
  )

  constructor() {
    planningEventEmitter.on(PlanningEventEmitter.ResolveHoverState, () => {
      this.resetHoverState()
      this.resetHoverState = () => {}
    })
  }
}
