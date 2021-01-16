import { RealmTodosData } from '@views/planning/RealmTodosData'
import { getTitle, Todo } from '@models/Todo'
import { realm } from '@utils/realm'
import { getDateDateString, getDateMonthAndYearString } from '@utils/time'
import { sockets } from '@sync/Sync'
import { Alert } from 'react-native'
import { translate } from '@utils/i18n'
import { navigate } from '@utils/navigation'
import { DragEndParams } from '@upacyxou/react-native-draggable-sectionlist'
import { sharedAppStateStore } from '@stores/AppStateStore'
import { sharedSocketStore } from '@stores/hydration/node_modules/@stores/SocketStore'

export class PlanningVM {
  uncompletedTodosData = new RealmTodosData(false)
  completedTodosData = new RealmTodosData(true)

  draggingEdit = false

  arrOfDraggedTodos = {} as {
    [index: string]: boolean
  }

  onDragEnd = (params: DragEndParams<Todo | string>) => {
    const { dataArr, to, from } = params
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
      let lastSection: string
      let todoIndexInSection = 0
      const lo = Math.min(from, to)
      const hi = Math.max(from, to)
      const today = Number(
        new Date().toISOString().slice(0, 10).split('-').join('')
      )
      realm.write(() => {
        dataArr.forEach((dataArrItem, globalIndex) => {
          // if section
          if (typeof dataArrItem === 'string') {
            todoIndexInSection = 0
            lastSection = dataArrItem
            return
          }
          // if todo within modified indexes and shouldn't be breakdown
          if (
            globalIndex >= lo &&
            globalIndex <= hi &&
            dataArrItem.frogFails < 3
          ) {
            // check is todo overdue
            if (
              (globalIndex === to || globalIndex === from) &&
              Number(getTitle(dataArrItem).split('-').join('')) < today
            ) {
              dataArrItem.frogFails++
              if (dataArrItem.frogFails > 1) {
                dataArrItem.frog = true
              }
            }
            dataArrItem.date = getDateDateString(lastSection)
            dataArrItem.monthAndYear = getDateMonthAndYearString(lastSection)
            dataArrItem._exactDate = new Date(lastSection)
            dataArrItem.updatedAt = new Date()
          }
          // if should breakdown
          if (dataArrItem.frogFails >= 3) {
            // if it is dragged todo
            if (globalIndex === to || globalIndex === from) {
              Alert.alert(translate('error'), translate('breakdownRequest'), [
                {
                  text: translate('cancel'),
                  style: 'cancel',
                },
                {
                  text: translate('breakdownButton'),
                  onPress: () => {
                    navigate('BreakdownTodo', {
                      breakdownTodo: dataArrItem,
                    })
                  },
                },
              ])
            }
          } else {
            dataArrItem.order = todoIndexInSection
          }
          todoIndexInSection++
        })
      })
    }
    if (sharedSocketStore.authorized && sharedSocketStore.connected) {
      sockets.todoSyncManager.sync()
    }
  }
}
