import { mobxRealmObject } from '@utils/mobx-realm/object'
import { clone, cloneDeep, omit } from 'lodash'
import { getTitle, Todo } from '@models/Todo'
import { sharedAppStateStore, TodoSectionType } from '@stores/AppStateStore'
import { realm } from '@utils/realm'
import {
  getDateDateString,
  getDateMonthAndYearString,
  getDateString,
} from '@utils/time'
import { computed, observable } from 'mobx'
import { sockets } from '@utils/sockets'
import { Alert } from 'react-native'
import { translate } from '@utils/i18n'
import { navigate } from '@utils/navigation'

export const getRealmTodos = (completed: boolean) => {
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

export interface TodoSection {
  section: string
  data: Todo[]
  order: number
}

// {} as {
//   [index: string]: TodoSection
// }

function insertBetweenTitles(
  originalObject: { [index: string]: TodoSection },
  titleToInsert: string,
  todoToBeInserted: Todo
) {
  const newObject = {} as { [index: string]: TodoSection }

  const titleToInsertDate = new Date(titleToInsert)

  let added = false

  const allTitles = Object.keys(originalObject)
  for (const titleIndex in allTitles) {
    const indexedTitleDate = new Date(allTitles[titleIndex])

    if (indexedTitleDate.getTime() > titleToInsertDate.getTime() && !added) {
      newObject[titleToInsert] = {
        order: 0,
        section: titleToInsert,
        data: [todoToBeInserted],
      }
      added = true
    }
    newObject[allTitles[titleIndex]] = originalObject[allTitles[titleIndex]]
  }
  return newObject
}

export class PlanningVM {
  @observable collapsedTitles = [] as string[]

  completedRealmTodos = getRealmTodos(true)
  uncompletedRealmTodos = getRealmTodos(false)

  lastTimeTodos: Realm.Collection<Todo> | undefined

  listenerInitialized = false
  lastArray: undefined | Todo[]

  lastArrayInitialized = false

  draggingEdit = false

  initialized = false
  initializedCompleted = false

  initializedMap = {} as {
    [index: string]: TodoSection
  }

  initializedCompletedMap = {} as {
    [index: string]: TodoSection
  }

  constructor() {
    if (!this.listenerInitialized) {
      this.uncompletedRealmTodos.addListener((todos, changes) => {
        if (!changes || !todos) return
        if (!this.lastArrayInitialized) {
          this.lastArrayInitialized = true
          this.lastArray = todos.slice()
        }

        if (this.draggingEdit) {
          this.draggingEdit = false
          return
        }

        let skipDeletion = false
        let skipInsertion = false

        const insertions = changes.insertions
        const deletions = changes.deletions
        const modifications = changes.modifications

        if (sharedAppStateStore.skipping) {
          // task skip
          const title = new Date().toISOString().slice(0, 10)
          const tempTodayDataArr = [...this.initializedMap[title].data]
          const firstTodo = tempTodayDataArr[0]
          this.initializedMap[title].data.splice(0, 1)
          this.initializedMap[title].data.splice(
            this.initializedMap[title].data.length,
            0,
            firstTodo
          )
          sharedAppStateStore.skipping = false
        }

        if (Object.keys(sharedAppStateStore.editedTodo).length) {
          skipInsertion = true
          skipDeletion = true
          const tempSyncId = sharedAppStateStore.editedTodo.tempSync
          const beforeEditTitle = sharedAppStateStore.editedTodo.beforeEdit
          const afterEditTitle = sharedAppStateStore.editedTodo.afterEdit
          const todoIndexInBeforeSection = this.initializedMap[
            beforeEditTitle
          ].data.findIndex((todo) => todo._tempSyncId === tempSyncId)
          const frog = this.initializedMap[beforeEditTitle].data[
            todoIndexInBeforeSection
          ].frog
          this.initializedMap[beforeEditTitle].data.splice(
            todoIndexInBeforeSection,
            1
          )
          if (!this.initializedMap[afterEditTitle]) {
            const todoToAddIndex =
              modifications[0] !== undefined ? modifications[0] : insertions[0]
            this.initializedMap = insertBetweenTitles(
              this.initializedMap,
              afterEditTitle,
              todos[todoToAddIndex]
            )
          } else {
            if (frog) {
              for (const todoIndex in this.initializedMap[afterEditTitle]
                .data) {
                const indexInNumber = Number(todoIndex)
                if (
                  this.initializedMap[afterEditTitle].data[indexInNumber].frog
                )
                  continue
                const todoToAddIndex =
                  modifications[0] !== undefined
                    ? modifications[0]
                    : insertions[0]
                this.initializedMap[afterEditTitle].data.splice(
                  indexInNumber,
                  0,
                  todos[todoToAddIndex]
                )
                break
              }
            } else {
              const todoToAddIndex =
                modifications[0] !== undefined
                  ? modifications[0]
                  : insertions[0]
              this.initializedMap[afterEditTitle].data.push(
                todos[todoToAddIndex]
              )
            }
          }
          if (!this.initializedMap[beforeEditTitle].data.length) {
            this.initializedMap = omit(this.initializedMap, [beforeEditTitle])
          }
          sharedAppStateStore.editedTodo = {} as any
        }

        if (insertions.length && !skipInsertion) {
          // insertions
          for (const insertIndex of insertions) {
            const todo = todos[insertIndex]
            const title = getTitle(todos[insertIndex])
            if (!this.initializedMap[title]) {
              this.initializedMap = insertBetweenTitles(
                this.initializedMap,
                title,
                mobxRealmObject(todo)
              )
              continue
            }
            if (todo.frog) {
              // frogs
              let lastOrder = -1
              const length = this.initializedMap[title].data.length
              for (let i = 0; i < length; i++) {
                const lastTodo = this.initializedMap[title].data[i]
                if (lastTodo.frog) {
                  lastOrder = lastTodo.order
                  continue
                }
                if (todo._tempSyncId) {
                  this.todosAndIndexes[todo._tempSyncId] = i
                }
                this.initializedMap[title].data.splice(i, 0, todo)
                break
              }
            } else {
              if (sharedAppStateStore.todosToTop.length) {
                const todoIndexInStore = sharedAppStateStore.todosToTop.findIndex(
                  (tempTodo) => tempTodo._tempSyncId === todo._tempSyncId
                )
                let firstNonFrog = 0
                for (let frogCounter in this.initializedMap[title].data) {
                  if (!this.initializedMap[title].data[frogCounter].frog) {
                    firstNonFrog = Number(frogCounter)
                    break
                  }
                }
                this.initializedMap[title].data.splice(firstNonFrog, 0, todo)
                sharedAppStateStore.todosToTop.splice(todoIndexInStore, 1)
                skipDeletion = true
              } else {
                const length = this.initializedMap[title].data.length
                this.initializedMap[title].data.splice(length, 0, todo)
              }
            }
          }
        }

        if (deletions.length && !skipDeletion) {
          for (const deletedIndex of deletions) {
            if (!this.lastArray) break
            const todo = this.lastArray[deletedIndex]
            const title = getTitle(todo)
            let todoIndexInMap: number | undefined
            this.initializedMap[title].data.find((searchTodo, index) => {
              if (searchTodo._tempSyncId === todo._tempSyncId)
                todoIndexInMap = index
            })
            if (todoIndexInMap !== undefined) {
              if (this.initializedMap[title].data.length <= 1) {
                this.initializedMap = omit(this.initializedMap, [title])
              } else {
                this.initializedMap[title].data.splice(todoIndexInMap, 1)
              }
            }
          }
        }
        this.lastArray = todos.slice()
        this.key = String(Date.now())
      })
      this.listenerInitialized = true
    }
  }

  @observable key = ''

  @computed get completedTodosMap() {
    return this.mapFromRealmTodos(this.completedRealmTodos, true)
  }

  @computed get theoreticalKey() {
    return this.key
  }

  todosAndIndexes = {} as any

  @computed get uncompletedTodosMap() {
    console.log('Got uncompletedTodosMap')
    const key = this.theoreticalKey
    return this.initialized
      ? this.initializedMap
      : this.mapFromRealmTodos(this.uncompletedRealmTodos, false)
  }

  @computed get uncompletedTodosArray() {
    console.log('Got uncompletedTodosArray')
    const key = this.theoreticalKey
    return Object.keys(this.uncompletedTodosMap).map(
      (key) => this.uncompletedTodosMap[key]
    )
  }

  @computed get completedTodosArray() {
    console.log('Got completedTodosArray')
    return Object.keys(this.completedTodosMap).map(
      (key) => this.completedTodosMap[key]
    )
  }

  @computed get realLods() {
    return this.loadingHashes
  }

  @observable loadingHashes = false

  get allTodosAndHash() {
    if (sharedAppStateStore.hash.length) {
      const hashes = sharedAppStateStore.hash
        .map((hash) => `text CONTAINS[c] "${hash}"`)
        .join(' AND ')
      const neededTodos = this.mapFromRealmTodos(
        this.uncompletedRealmTodos.filtered(hashes),
        false,
        true
      )
      const hashTodosMap = Object.keys(neededTodos).map(
        (key) => neededTodos[key]
      )
      return hashTodosMap
    } else if (sharedAppStateStore.searchQuery) {
      sharedAppStateStore.changeLoading(true)
      const neededQueryTodos = this.mapFromRealmTodos(
        this.uncompletedRealmTodos.filtered(
          `${`text CONTAINS[c] "${sharedAppStateStore.searchQuery}"`}`
        ),
        false,
        true
      )
      const queryTodosMap = Object.keys(neededQueryTodos).map(
        (key) => neededQueryTodos[key]
      )
      setTimeout(() => sharedAppStateStore.changeLoading(false))
      return queryTodosMap
    }
  }

  mapFromRealmTodos(
    realmTodos: Realm.Results<Todo> | Todo[],
    completed: boolean,
    hashes?: boolean
  ) {
    realmTodos = realmTodos.slice().sort((a) => {
      if (a.frog) return -1
      return 1
    }) as Todo[]
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
    if (!hashes) {
      if (completed) {
        this.initializedCompleted = true
        this.initializedCompletedMap = map
      } else {
        this.initialized = true
        this.initializedMap = map
      }
    }
    return map
  }

  onDragEnd = ({
    data,
    from,
    to,
    dataArr,
  }: {
    data: TodoSection[]
    dataArr: Array<Todo & string>
    from: number
    to: number
  }) => {
    sharedAppStateStore.changeLoading(true)
    if (sharedAppStateStore.activeDay) {
      const todo = dataArr[to] as Todo
      if (todo && todo._tempSyncId && sharedAppStateStore.activeDay) {
        sharedAppStateStore.editedTodo.tempSync = todo._tempSyncId
        sharedAppStateStore.editedTodo.beforeEdit = getTitle(todo)
        realm.write(() => {
          todo.date = getDateDateString(sharedAppStateStore.activeDay!)
          todo.monthAndYear = getDateMonthAndYearString(
            sharedAppStateStore.activeDay!
          )
          todo._exactDate = new Date(getTitle(todo))
          todo.updatedAt = new Date()
        })
        sharedAppStateStore.editedTodo.afterEdit = getDateString(
          sharedAppStateStore.activeDay!
        )
      }
      sharedAppStateStore.activeDay = undefined
      sharedAppStateStore.activeCoordinates = { x: 0, y: 0 }
    } else {
      let lastSection: string
      let map = {} as { [index: string]: TodoSection }

      let sectionCounter = -1
      let randomOtherCounter = 0

      const draggingFrogs = dataArr[from].frog && dataArr[to].frog
      const halfFrog = dataArr[from].frog || dataArr[to].frog || dataArr[to + 1]

      if (!draggingFrogs && halfFrog) {
        if (dataArr[to + 1].frog && !dataArr[to].frog) {
          this.key = String(Date.now())
          return
        }
        if (dataArr[to].frog) {
          if (!dataArr[to - 1].frog && !dataArr[to + 1].frog) {
            this.key = String(Date.now())
            return
          }
          if (dataArr[to - 1].frog) {
            this.key = String(Date.now())
            return
          }
        }
        if (dataArr[from].frog) {
          if (dataArr[from - 1].frog) {
            this.key = String(Date.now())
            return
          }
          if (dataArr[to - 1].frog) {
            this.key = String(Date.now())
            return
          }
        }
      }

      const lo = Math.min(from, to)
      const hi = Math.max(from, to)

      const today = Number(
        new Date().toISOString().slice(0, 10).split('-').join('')
      )

      realm.write(() => {
        dataArr.forEach((dataArrItem, globalIndex) => {
          if (!dataArrItem.text) {
            randomOtherCounter = 0
            sectionCounter++
            lastSection = dataArrItem
            map[lastSection] = {
              order: sectionCounter,
              section: dataArrItem,
              data: [],
            }
            return
          }
          if (
            globalIndex >= lo &&
            globalIndex <= hi &&
            dataArrItem.frogFails < 3
          ) {
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

          if (dataArrItem.frogFails >= 3) {
            if (
              (globalIndex === to || globalIndex === from) &&
              dataArrItem.frogFails >= 3
            ) {
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
              map[getTitle(dataArrItem)].data.splice(0, 0, dataArrItem)
              dataArrItem.order = -1000
            }
          } else {
            dataArrItem.order = randomOtherCounter
            map[lastSection].data.push(dataArrItem)
          }
          randomOtherCounter++
        })
      })

      // remove section if there's no more todos
      Object.keys(map).forEach((key) => {
        if (!map[key].data.length) {
          map = omit(map, [key])
        }
      })
      this.initializedMap = map
      this.draggingEdit = true
    }
    this.key = String(Date.now())
    this.key = String(Date.now())
    sharedAppStateStore.changeLoading(false)
    sockets.todoSyncManager.sync()
  }
}
