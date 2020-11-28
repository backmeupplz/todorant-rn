import { mobxRealmCollection } from '@utils/mobx-realm/collection'
import { mobxRealmObject } from '@utils/mobx-realm/object'
import { compareTodos, getTitle, isTodoOld, Todo } from '@models/Todo'
import { sharedAppStateStore, TodoSectionType } from '@stores/AppStateStore'
import { sharedSettingsStore } from '@stores/SettingsStore'
import { sharedTodoStore } from '@stores/TodoStore'
import { fixOrder } from '@utils/fixOrder'
import { translate } from '@utils/i18n'
import { navigate } from '@utils/navigation'
import { realm } from '@utils/realm'
import { sockets } from '@utils/sockets'
import {
  getDateDateString,
  getDateMonthAndYearString,
  getDateString,
  isDateTooOld,
} from '@utils/time'
import { SectionHeaderOrTodo } from '@views/planning/SectionHeaderOrTodo'
import { computed, IObservableArray, observable } from 'mobx'
import { Alert } from 'react-native'

let oleg = {}

export interface TodoSection {
  section: string
  data: Todo[]
  order: number
}

export class PlanningVM {
  @observable collapsedTitles = [] as string[]

  completedRealmTodos = mobxRealmCollection(this.getRealmTodos(true))
  uncompletedRealmTodos = mobxRealmCollection(this.getRealmTodos(false))

  @computed get completedTodosMap() {
    return this.mapFromRealmTodos(this.completedRealmTodos)
  }
  @computed get uncompletedTodosMap() {
    console.log('Got uncompletedTodosMap')
    return this.mapFromRealmTodos(this.uncompletedRealmTodos)
  }

  @computed get uncompletedTodosArray() {
    console.log('Got uncompletedTodosArray')
    return Object.keys(this.uncompletedTodosMap).map(
      (key) => this.uncompletedTodosMap[key]
    )
  }

  mapFromRealmTodos(realmTodos: IObservableArray<Todo>) {
    const map = {} as { [index: string]: TodoSection }
    let currentTitle: string | undefined = undefined
    let i = 0
    for (const realmTodo of realmTodos) {
      const realmTodoTitle = getTitle(realmTodo)
      if (currentTitle && currentTitle !== realmTodoTitle) {
        i++
      }
      if (map[realmTodoTitle]) {
        map[realmTodoTitle].data.push(mobxRealmObject(realmTodo))
      } else {
        map[realmTodoTitle] = {
          order: i,
          section: realmTodoTitle,
          data: [mobxRealmObject(realmTodo)],
        }
      }
    }
    return map
  }

  getRealmTodos(completed: boolean) {
    return realm
      .objects(Todo)
      .filtered('deleted = false')
      .filtered('delegateAccepted != false')
      .filtered(`completed = ${completed ? 'true' : 'false'}`)
      .sorted([
        ['_exactDate', completed],
        ['order', false],
      ])
  }

  @computed get allTodosAndHash() {
    const hashes = sharedAppStateStore.hash
      .map((hash) => `text CONTAINS[c] "${hash}"`)
      .join(' AND ')
    return []
  }

  // @computed get todosWithSections() {
  //   const mappedTodos = this.allTodosAndHash.reduce((prev, cur) => {
  //     if (cur.date) {
  //       const date = `${cur.monthAndYear}-${cur.date}`
  //       if (prev[date]) {
  //         prev[date].push(cur)
  //       } else {
  //         prev[date] = [cur]
  //       }
  //     } else if (cur.monthAndYear) {
  //       const month = cur.monthAndYear
  //       if (prev[month]) {
  //         prev[month].push(cur)
  //       } else {
  //         prev[month] = [cur]
  //       }
  //     }
  //     return prev
  //   }, {} as { [index: string]: Todo[] })
  //   const gatheredTodos = [] as {
  //     title: string
  //     todos: Todo[]
  //   }[]
  //   for (const key in mappedTodos) {
  //     gatheredTodos.push({
  //       title: key,
  //       todos: mappedTodos[key],
  //     })
  //   }
  //   const today = getDateString(new Date())
  //   gatheredTodos.sort((a, b) => {
  //     if (isDateTooOld(a.title, today) && !isDateTooOld(b.title, today)) {
  //       return sharedAppStateStore.todoSection === TodoSectionType.planning
  //         ? -1
  //         : 1
  //     } else if (
  //       !isDateTooOld(a.title, today) &&
  //       isDateTooOld(b.title, today)
  //     ) {
  //       return sharedAppStateStore.todoSection === TodoSectionType.planning
  //         ? 1
  //         : -1
  //     }
  //     return sharedAppStateStore.todoSection === TodoSectionType.planning
  //       ? new Date(a.title) > new Date(b.title)
  //         ? 1
  //         : -1
  //       : new Date(a.title) < new Date(b.title)
  //       ? 1
  //       : -1
  //   })
  //   let result: SectionHeaderOrTodo[] = []
  //   for (const todoSection of gatheredTodos) {
  //     result = [
  //       ...result,
  //       {
  //         title: todoSection.title,
  //         numberOfItems: todoSection.todos.length,
  //       },
  //       ...(true // this.collapsedTitles.indexOf(todoSection.title) < 0 // comment out for now untill better times
  //         ? todoSection.todos
  //             .sort(
  //               compareTodos(
  //                 sharedAppStateStore.todoSection === TodoSectionType.completed
  //               )
  //             )
  //             .map((v) => ({ item: v }))
  //         : []),
  //     ]
  //   }
  //   return result
  // }

  onDragEnd = async ({
    data,
    from,
    to,
  }: {
    data: TodoSection[]
    from: number
    to: number
  }) => {
    const saveTodo = async (section: string, todo: Todo, index: number) => {
      todo.order = index
      todo.date = getDateDateString(section)
      todo.monthAndYear = getDateMonthAndYearString(section)
      todo.updatedAt = new Date()
      todo._exactDate = new Date(getTitle(todo))
    }

    let counter = -1
    const descended = from - to < 0
    realm.write(() => {
      data.forEach((sectionValue) => {
        counter++
        sectionValue.data.forEach((todo: Todo, index: number) => {
          // todo.order = index
          counter++
          if (descended) {
            if (from - counter <= 0 && to - counter >= 0) {
              saveTodo(sectionValue.section, todo, index)
            }
          } else {
            if (from - counter >= 0 && to - counter <= 0) {
              saveTodo(sectionValue.section, todo, index)
            }
          }
        })
      })
    })

    // let todoToRecorded: any
    // let todoFromRecorded = false
    // involvedTodos.forEach((involvedTodo) => {
    //   if (involvedTodo.counter === to) {
    //     const shouldChangeHigher =
    //       data[involvedTodo.key][involvedTodo.index - 2].order >
    //       involvedTodo.order
    //     realm.write(() => {

    //     })
    //   }
    // })
  }
  // } else {
  //   if (to - counter === 0) {
  //     console.log(todo.text)
  //   }
  // }
  // realm.write(() => {
  //   todo.order = index
  //   todo.date = getDateDateString(key)
  //   todo.monthAndYear = getDateMonthAndYearString(key)
  //   todo.updatedAt = new Date()
  //   todo._exactDate = new Date(getTitle(todo))
  // })

  // // Create the map of werre titles start and end
  // const titleToIndexes = [] as [string, number, number][] // title, startIndex, endIndex
  // this.todosWithSections.forEach((item, i) => {
  //   if (item.title) {
  //     titleToIndexes.push([item.title, i, i])
  //     if (titleToIndexes.length > 1) {
  //       titleToIndexes[titleToIndexes.length - 2][2] = i - 1
  //     }
  //   }
  // })
  // // Create a placeholder for the affected titles to fix order later
  // const affectedTitles = [] as string[]
  // // Get the dragged item
  // const draggedItem = this.todosWithSections[from]
  // // If it is todo, then derive from and to titles to add to affected titles
  // if (draggedItem.item) {
  //   const titleFrom = getTitle(draggedItem.item)
  //   let titleTo: string | undefined
  //   if (to === 0) {
  //     titleTo = titleToIndexes[0][0]
  //   } else {
  //     for (const titleToIndex of [...titleToIndexes].reverse()) {
  //       if (to > from ? to >= titleToIndex[1] : to > titleToIndex[1]) {
  //         titleTo = titleToIndex[0]
  //         break
  //       }
  //     }
  //   }
  //   if (titleTo) {
  //     if (titleFrom === titleTo) {
  //       affectedTitles.push(titleFrom)
  //     } else {
  //       affectedTitles.push(titleFrom, titleTo)
  //     }
  //   }
  //   if (draggedItem.item.frogFails > 2 && titleTo !== titleFrom) {
  //     setTimeout(() => {
  //       Alert.alert(translate('error'), translate('breakdownRequest'), [
  //         {
  //           text: translate('cancel'),
  //           style: 'cancel',
  //         },
  //         {
  //           text: translate('breakdownButton'),
  //           onPress: () => {
  //             navigate('BreakdownTodo', {
  //               breakdownTodo: draggedItem.item,
  //             })
  //           },
  //         },
  //       ])
  //     }, 100)
  //     return
  //   }
  // }
  // // It it is title add itself and its old and new neighbours to affected titles
  // else if (draggedItem.title) {
  //   // Add the title
  //   affectedTitles.push(draggedItem.title)
  //   // Add old neighbours
  //   titleToIndexes.forEach((titleToIndex, i) => {
  //     if (titleToIndex[0] === draggedItem.title) {
  //       if (i - 1 > -1) {
  //         affectedTitles.push(titleToIndexes[i - 1][0])
  //       }
  //       if (i + 1 < titleToIndexes.length) {
  //         affectedTitles.push(titleToIndexes[i + 1][0])
  //       }
  //     }
  //   })
  //   // Add new neighbours
  //   for (const titleToIndex of titleToIndexes) {
  //     if (to > titleToIndex[1] && to <= titleToIndex[2]) {
  //       if (affectedTitles.indexOf(titleToIndex[0]) < 0) {
  //         affectedTitles.push(titleToIndex[0])
  //       }
  //     }
  //   }
  // }
  // // Get a copy of affected titles (we are going to modify the original array)
  // const affectedTitlesCopy = [...affectedTitles]
  // // Get first title
  // let currentTitle = ''
  // let currentMonthAndYear = ''
  // let currentDate: string | undefined
  // for (const sectionHeaderOrTodo of data) {
  //   if (sectionHeaderOrTodo.title) {
  //     currentTitle = sectionHeaderOrTodo.title
  //     currentMonthAndYear = currentTitle.substr(0, 7)
  //     currentDate =
  //       currentTitle.length > 7 ? currentTitle.substr(8, 2) : undefined
  //     break
  //   }
  // }
  // // Go over all titles and todos, make note of all affected todos and titles
  // let titleCounter = ''
  // const affectedSectionHeadersOrTodo = [] as SectionHeaderOrTodo[]
  // for (const sectionHeaderOrTodo of data) {
  //   if (sectionHeaderOrTodo.title) {
  //     const prevIndex = affectedTitles.indexOf(titleCounter)
  //     if (prevIndex > -1) {
  //       affectedTitles.splice(prevIndex, 1)
  //       if (!affectedTitles.length) {
  //         break
  //       }
  //     }
  //     titleCounter = sectionHeaderOrTodo.title
  //   }
  //   if (!titleCounter || affectedTitles.indexOf(titleCounter) > -1) {
  //     affectedSectionHeadersOrTodo.push(sectionHeaderOrTodo)
  //   }
  // }
  // // Fix order of tasks and titles
  // let orderCounter = 0
  // affectedSectionHeadersOrTodo.forEach((sectionHeaderOrTodo) => {
  //   if (sectionHeaderOrTodo.title) {
  //     if (sectionHeaderOrTodo.title !== currentTitle) {
  //       orderCounter = 0
  //     }
  //     currentTitle = sectionHeaderOrTodo.title
  //     currentMonthAndYear = currentTitle.substr(0, 7)
  //     currentDate =
  //       currentTitle.length > 7 ? currentTitle.substr(8, 2) : undefined
  //   } else if (sectionHeaderOrTodo.item) {
  //     const todo = sectionHeaderOrTodo.item
  //     if (
  //       todo.order !== orderCounter ||
  //       todo.monthAndYear !== currentMonthAndYear ||
  //       todo.date !== currentDate
  //     ) {
  //       const failed =
  //         isTodoOld(todo) &&
  //         (todo.monthAndYear !== currentMonthAndYear ||
  //           todo.date !== currentDate) &&
  //         !todo.completed
  //       realm.write(() => {
  //         todo.order = orderCounter
  //         todo.monthAndYear = currentMonthAndYear
  //         todo.date = currentDate
  //         todo._exactDate = new Date(getTitle(todo))
  //         todo.updatedAt = new Date()
  //         if (failed && !todo.date) {
  //           todo.frogFails++
  //           if (todo.frogFails > 1) {
  //             todo.frog = true
  //           }
  //         }
  //       })
  //     }
  //     orderCounter++
  //   }
  // })
  // // Sync and fix time order if necessary
  // if (sharedSettingsStore.preserveOrderByTime) {
  //   fixOrder(
  //     affectedTitlesCopy,
  //     undefined,
  //     undefined,
  //     draggedItem.item ? [draggedItem.item] : undefined
  //   )
  // } else {
  //   // Refresh
  //   sharedTodoStore.refreshTodos()
  //   sockets.todoSyncManager.sync()
  // }
}
