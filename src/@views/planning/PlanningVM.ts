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

export const planningEventEmitter = new EventEmitter()

export enum PlanningEventEmitter {
  ResolveHoverState = 'ResolveHoverState',
}

export class PlanningVM {
  uncompletedTodosData = new RealmTodosData(false)
  completedTodosData = new RealmTodosData(true)

  resetHoverState = () => {}

  draggingEdit = false

  arrOfDraggedTodos = {} as {
    [index: string]: boolean
  }

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
    } else {
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
        const today = getTodayWithStartOfDay().getTime()
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
            if (i === from || i === to) {
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
    }
    if (
      sharedSync.socketConnection.authorized &&
      sharedSync.socketConnection.connected
    ) {
      sharedSync.sync(SyncRequestEvent.Todo)
    }
  }
}
