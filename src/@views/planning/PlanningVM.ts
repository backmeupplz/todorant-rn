import { sharedSync } from '@sync/Sync'
import { RealmTodosData } from '@views/planning/RealmTodosData'
import { getTitle, Todo } from '@models/Todo'
import { realm } from '@utils/realm'
import { getDateDateString, getDateMonthAndYearString } from '@utils/time'
import { Alert } from 'react-native'
import { translate } from '@utils/i18n'
import { navigate } from '@utils/navigation'
import { DragEndParams } from '@upacyxou/react-native-draggable-sectionlist'
import { sharedAppStateStore } from '@stores/AppStateStore'
import { SyncRequestEvent } from '@sync/SyncRequestEvent'

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
      // const findClosestSection = (index: number) => {
      //   let closestSection: undefined | string
      //   for (let i = index; i > 0; i--) {
      //     if (typeof dataArr[i] === 'string') {
      //       closestSection = dataArr[i] as string
      //       break
      //     }
      //   }
      //   return closestSection
      // // }
      const findClosestSection = (index: number) => {
        let closestSection: undefined | number
        for (let i = index; i > 0; i--) {
          if (typeof dataArr[i] === 'string') {
            closestSection = i
            break
          }
        }
        return closestSection
      }
      const lo = Math.min(from, to)
      const hi = Math.max(from, to)
      const today = Number(
        new Date().toISOString().slice(0, 10).split('-').join('')
      )
      const goingDown = from < to ? true : false
      const movingBetweenDays = dataArr
        .slice(lo, hi)
        .some((item) => typeof item === 'string')
      // realm.write(() => {
      //   if (movingBetweenDays) {
      //     // if drag in one day
      //   } else {
      //     // if dragging from top to bottom
      //     if (goingDown) {
      //       let lastOrder = dataArr[from - 1].order + 1 || 0
      //       for (let i = lo; i <= hi; i++) {
      //         // if (typeof dataArr[i] === 'string') return
      //         ;(dataArr[i] as Todo).order = lastOrder
      //         lastOrder++
      //       }
      //       // if from bottom to top
      //     } else {
      //       let lastOrder = dataArr[to].order
      //       for (let i = hi; i >= lo; i--) {
      //         // if (typeof dataArr[i] === 'string') return
      //         ;(dataArr[i] as Todo).order = lastOrder
      //         lastOrder--
      //       }
      //     }
      //   }
      // })

      const startTime = Date.now()

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
      console.log('\n\n\n\n\n')
      console.log(Date.now() - startTime)
    }
    if (
      sharedSync.socketConnection.authorized &&
      sharedSync.socketConnection.connected
    ) {
      sharedSync.sync(SyncRequestEvent.Todo)
    }
  }
}
