import { sharedSync } from '@sync/Sync'
import { RealmTodosData } from '@views/planning/RealmTodosData'
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
      Q.where('is_deleted', false),
      Q.where('is_completed', completed),
      Q.experimentalSortBy('exact_date_at', completed ? Q.desc : Q.asc),
      Q.experimentalSortBy('is_frog', Q.desc),
      Q.experimentalSortBy('order', Q.asc)
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

  onDragEnd = (params: DragEndParams<Todo | string>) => {
    const { beforeChangesArr, dataArr, to, from, promise } = params
    // enable loader
    sharedAppStateStore.changeLoading(true)
    // check is calendar dragging
    if (sharedAppStateStore.activeDay) {
      const todo = dataArr[to] as Todo
      if (todo) {
        realm.write(() => {
          todo.date = getDateDateString(sharedAppStateStore.activeDay!)
          todo.monthAndYear = getDateMonthAndYearString(
            sharedAppStateStore.activeDay!
          )
          const newTitle = getTitle(todo)
          todo._exactDate = new Date(newTitle)
          todo.updatedAt = new Date()
        })
      }
      // discard calendar after applying changes
      sharedAppStateStore.activeDay = undefined
      sharedAppStateStore.activeCoordinates = { x: 0, y: 0 }
      this.setCoordinates.cancel()
      promise()
    } else {
      if (from === to || from === 0 || to === 0) {
        this.resetHoverState()
        promise()
        this.uncompletedTodosData.updateInvalidationKeys()
        return
      }
      // we are saving promise for reseting hover state in future
      this.resetHoverState = promise
      // help us to find closest section (looks from bottom to the top)
      const findClosestSection = (
        index: number,
        arrToSearch: (string | Todo)[]
      ) => {
        let closestSection = 0
        for (let i = index; i >= 0; --i) {
          if (typeof arrToSearch[i] === 'string') {
            closestSection = i
            break
          }
        }
        return closestSection
      }

      let disableLoading = false

      const closestFrom = findClosestSection(from, beforeChangesArr)
      const closestTo = findClosestSection(to, dataArr)
      if (closestFrom === closestTo) {
        realm.write(() => {
          let lastOrder = 0
          for (let i = closestTo + 1; ; i++) {
            const item = dataArr[i]
            if (item === undefined) break
            if (typeof item === 'string') break
            item.order = lastOrder
            item.updatedAt = new Date()
            lastOrder++
          }
        })
      } else {
        const lowerDay = Math.min(closestFrom, closestTo)
        const maxDay = Math.max(closestFrom, closestTo)
        realm.write(() => {
          let lastOrder = 0
          let lastSection = dataArr[lowerDay] as string
          for (let i = lowerDay + 1; ; i++) {
            const item = dataArr[i]
            if (item === undefined) break
            if (typeof item === 'string') {
              // if new section, outside of our draggable items begin
              if (
                new Date(item).getTime() >
                new Date(dataArr[maxDay] as string).getTime()
              )
                break
              lastOrder = 0
              lastSection = item
              continue
            }
            if (i === to) {
              if (isTodoOld(item)) {
                if (item.frogFails < 3) {
                  if (item.frogFails >= 1) {
                    item.frog = true
                  }
                  item.frogFails++
                  item.updatedAt = new Date()
                } else {
                  Alert.alert(
                    translate('error'),
                    translate('breakdownRequest'),
                    [
                      {
                        text: translate('cancel'),
                        style: 'cancel',
                      },
                      {
                        text: translate('breakdownButton'),
                        onPress: () => {
                          navigate('BreakdownTodo', {
                            breakdownTodo: item,
                          })
                        },
                      },
                    ]
                  )
                  lastOrder++
                  disableLoading = true
                  continue
                }
              }
            }
            item.date = getDateDateString(lastSection)
            item.monthAndYear = getDateMonthAndYearString(lastSection)
            item._exactDate = new Date(lastSection)
            item.order = lastOrder
            item.updatedAt = new Date()
            lastOrder++
          }
        })
      }
      if (disableLoading) {
        sharedAppStateStore.changeLoading(false)
      }
    }
    if (
      sharedSync.socketConnection.authorized &&
      sharedSync.socketConnection.connected
    ) {
      sharedSync.sync(SyncRequestEvent.Todo)
    }
  }
}
