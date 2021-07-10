import { sharedSync } from '@sync/Sync'
import { getTitle, Todo } from '@models/Todo'
import { realm } from '@utils/realm'
import {
  getDateDateString,
  getDateMonthAndYearString,
  getTodayWithStartOfDay,
} from '@utils/time'
import { Alert } from 'react-native'
import { translate } from '@utils/i18n'
import { navigate } from '@utils/navigation'
import { DragEndParams } from '@upacyxou/react-native-draggable-sectionlist'
import { sharedAppStateStore } from '@stores/AppStateStore'
import { SyncRequestEvent } from '@sync/SyncRequestEvent'
import { EventEmitter } from 'events'
import { isTodoOld } from '@utils/isTodoOld'
import { debounce } from 'lodash'
import { todosCollection } from '@utils/wmdb'
import { Q } from '@nozbe/watermelondb'
import { TodoColumn } from '@utils/melondb'
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
    return todosCollection.query(
      Q.experimentalJoinTables(['users']),
      Q.where('is_deleted', false),
      Q.where('is_completed', completed),
      Q.or(
        Q.where(TodoColumn.user, null),
        Q.on('users', 'server_id', sharedSessionStore.user?._id)
      ),
      Q.or(
        Q.where(TodoColumn.delegator, null),
        Q.where(TodoColumn.delegateAccepted, true)
      )
      //QQ.where('server_id', null)

      //Q.where(TodoColumn.user, null)
    )
    // TODO user and delegation in wmdb
    // .filtered(`user._id = "${sharedSessionStore.user?._id}" OR user = null`)
    // .filtered('delegator = null OR delegateAccepted = true')
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
