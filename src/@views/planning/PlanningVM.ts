import { RealmTodosData } from '@views/planning/RealmTodosData'
import { TodoSection } from '@views/planning/TodoSection'
import { omit } from 'lodash'
import { getTitle, Todo } from '@models/Todo'
import { realm } from '@utils/realm'
import {
  getDateDateString,
  getDateMonthAndYearString,
  getDateString,
} from '@utils/time'
import { sockets } from '@utils/sockets'
import { Alert } from 'react-native'
import { translate } from '@utils/i18n'
import { navigate } from '@utils/navigation'
import { DragEndParams } from '@upacyxou/react-native-draggable-sectionlist'

export class PlanningVM {
  uncompletedTodosData = new RealmTodosData(false)
  completedTodosData = new RealmTodosData(true)

  draggingEdit = false

  arrOfDraggedTodos = {} as {
    [index: string]: boolean
  }

  get allTodosAndHash() {
    return [] as TodoSection<Todo>[]
    // if (sharedAppStateStore.hash.length) {
    //   const hashes = sharedAppStateStore.hash
    //     .map((hash) => `text CONTAINS[c] "${hash}"`)
    //     .join(' AND ')
    //   const neededTodos = this.mapFromRealmTodos(
    //     this.uncompletedRealmTodos.filtered(hashes),
    //     false,
    //     true
    //   )
    //   const hashTodosMap = Object.keys(neededTodos).map(
    //     (key) => neededTodos[key]
    //   )
    //   return hashTodosMap
    // } else if (sharedAppStateStore.searchQuery) {
    //   sharedAppStateStore.changeLoading(true)
    //   const neededQueryTodos = this.mapFromRealmTodos(
    //     this.uncompletedRealmTodos.filtered(
    //       `${`text CONTAINS[c] "${sharedAppStateStore.searchQuery}"`}`
    //     ),
    //     false,
    //     true
    //   )
    //   const queryTodosMap = Object.keys(neededQueryTodos).map(
    //     (key) => neededQueryTodos[key]
    //   )
    //   setTimeout(() => sharedAppStateStore.changeLoading(false))
    //   return queryTodosMap
    // }
  }

  onDragEnd = <T>(params: DragEndParams<T>) => {
    // sharedAppStateStore.changeLoading(true)
    // if (sharedAppStateStore.activeDay) {
    //   const todo = dataArr[to] as Todo
    //   if (todo && todo._tempSyncId && sharedAppStateStore.activeDay) {
    //     sharedAppStateStore.editedTodo.tempSync = todo._tempSyncId
    //     sharedAppStateStore.editedTodo.beforeEdit = getTitle(todo)
    //     realm.write(() => {
    //       todo.date = getDateDateString(sharedAppStateStore.activeDay!)
    //       todo.monthAndYear = getDateMonthAndYearString(
    //         sharedAppStateStore.activeDay!
    //       )
    //       const newTitle = getTitle(todo)
    //       todo._exactDate = new Date(newTitle)
    //       todo.updatedAt = new Date()
    //     })
    //     sharedAppStateStore.editedTodo.afterEdit = getDateString(
    //       sharedAppStateStore.activeDay!
    //     )
    //   }
    //   sharedAppStateStore.activeDay = undefined
    //   sharedAppStateStore.activeCoordinates = { x: 0, y: 0 }
    // } else {
    //   let lastSection: string
    //   let map = {} as { [index: string]: TodoSection }
    //   let sectionCounter = -1
    //   let randomOtherCounter = 0
    //   const draggingFrogs =
    //     dataArr[from].frog &&
    //     dataArr[to].frog &&
    //     (dataArr[from - 1].frog || !dataArr[from - 1].text)
    //   const halfFrog =
    //     dataArr[from].frog ||
    //     dataArr[to].frog ||
    //     (dataArr[to + 1] && dataArr[to + 1].frog) ||
    //     (dataArr[from - 1] && dataArr[from - 1].frog) ||
    //     (dataArr[from].frog && dataArr[to].frog && !dataArr[to - 1].frog)
    //   if (!draggingFrogs && halfFrog) {
    //     this.uncompletedKey = String(Date.now())
    //     this.uncompletedKey = String(Date.now())
    //     sharedAppStateStore.changeLoading(false)
    //     return
    //   }
    //   const lo = Math.min(from, to)
    //   const hi = Math.max(from, to)
    //   const today = Number(
    //     new Date().toISOString().slice(0, 10).split('-').join('')
    //   )
    //   realm.write(() => {
    //     dataArr.forEach((dataArrItem, globalIndex) => {
    //       if (!dataArrItem.text) {
    //         randomOtherCounter = 0
    //         sectionCounter++
    //         lastSection = dataArrItem
    //         map[lastSection] = {
    //           order: sectionCounter,
    //           section: dataArrItem,
    //           data: [],
    //         }
    //         return
    //       }
    //       if (
    //         globalIndex >= lo &&
    //         globalIndex <= hi &&
    //         dataArrItem.frogFails < 3
    //       ) {
    //         if (
    //           (globalIndex === to || globalIndex === from) &&
    //           Number(getTitle(dataArrItem).split('-').join('')) < today
    //         ) {
    //           dataArrItem.frogFails++
    //           if (dataArrItem.frogFails > 1) {
    //             dataArrItem.frog = true
    //           }
    //         }
    //         dataArrItem.date = getDateDateString(lastSection)
    //         dataArrItem.monthAndYear = getDateMonthAndYearString(lastSection)
    //         dataArrItem._exactDate = new Date(lastSection)
    //         dataArrItem.updatedAt = new Date()
    //       }
    //       if (dataArrItem.frogFails >= 3) {
    //         if (
    //           (globalIndex === to || globalIndex === from) &&
    //           dataArrItem.frogFails >= 3
    //         ) {
    //           Alert.alert(translate('error'), translate('breakdownRequest'), [
    //             {
    //               text: translate('cancel'),
    //               style: 'cancel',
    //             },
    //             {
    //               text: translate('breakdownButton'),
    //               onPress: () => {
    //                 navigate('BreakdownTodo', {
    //                   breakdownTodo: dataArrItem,
    //                 })
    //               },
    //             },
    //           ])
    //           map[getTitle(dataArrItem)].data.splice(0, 0, dataArrItem)
    //           dataArrItem.order = -1000
    //         }
    //       } else {
    //         dataArrItem.order = randomOtherCounter
    //         map[lastSection].data.push(dataArrItem)
    //       }
    //       randomOtherCounter++
    //     })
    //   })
    //   // remove section if there's no more todos
    //   Object.keys(map).forEach((key) => {
    //     if (!map[key].data.length) {
    //       map = omit(map, [key])
    //     }
    //   })
    //   this.initializedMap = map
    //   this.draggingEdit = true
    // }
    // this.uncompletedKey = String(Date.now())
    // this.uncompletedKey = String(Date.now())
    // sharedAppStateStore.changeLoading(false)
    // sockets.todoSyncManager.sync()
  }
}
