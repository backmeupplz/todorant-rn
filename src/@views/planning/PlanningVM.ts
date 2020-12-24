import { mobxRealmObject } from '@utils/mobx-realm/object'
import { clone, cloneDeep, last, omit } from 'lodash'
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
import { parse, stringify } from 'flatted'

export const getRealmTodos = (completed: boolean) => {
  return realm
    .objects(Todo)
    .filtered('deleted = false')
    .filtered('delegateAccepted != false')
    .filtered(`completed = ${completed ? 'true' : 'false'}`)
    .sorted([
      ['_exactDate', completed],
      ['frog', true],
      ['order', false],
    ])
}

export interface TodoSection {
  section: string
  data: Todo[]
  order: number
}

function insertBetweenTitles(
  originalObject: { [index: string]: TodoSection },
  titleToInsert: string,
  todoToBeInserted: Todo
) {
  const newObject = {} as { [index: string]: TodoSection }

  const titleToInsertDate = new Date(titleToInsert)

  let added = false

  const allTitles = Object.keys(originalObject)
  for (const titleIndex of allTitles) {
    const indexedTitleDate = new Date(titleIndex)
    if (indexedTitleDate.getTime() > titleToInsertDate.getTime() && !added) {
      newObject[titleToInsert] = {
        order: 0,
        section: titleToInsert,
        data: [todoToBeInserted],
      }
      added = true
    }
    newObject[titleIndex] = originalObject[titleIndex]
  }
  if (!added) {
    newObject[titleToInsert] = {
      order: 0,
      section: titleToInsert,
      data: [todoToBeInserted],
    }
  }
  return newObject
}

let listenerInitialized = false

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

  arrOfDraggedTodos = {} as {
    [index: string]: boolean
  }

  private removeTodoFromArray = (todoArr: Todo[], todoId: string) => {
    return todoArr.filter((todo) => (todo._tempSyncId || todo._id) !== todoId)
  }

  private insertTodo = (todoArr: Todo[], todoToBeInserted: Todo) => {
    if (todoToBeInserted.frog) {
      const length = todoArr.length
      let added = false
      for (let i = 0; i < length; i++) {
        const lastTodo = todoArr[i]
        if (lastTodo.frog) {
          continue
        }
        todoArr.splice(i, 0, todoToBeInserted)
        added = true
        break
      }
      if (!added) {
        todoArr.splice(length, 0, todoToBeInserted)
      }
    } else {
      // prevent inserting non-frog todo at frog place
      if (
        todoArr[todoToBeInserted.order] &&
        todoArr[todoToBeInserted.order].frog
      ) {
        for (
          let frogCounter = todoToBeInserted.order;
          frogCounter < todoArr.length;
          frogCounter++
        ) {
          if (todoArr[frogCounter].frog) continue
          todoArr.splice(frogCounter, 0, todoToBeInserted)
          break
        }
      } else {
        todoArr.splice(todoToBeInserted.order, 0, todoToBeInserted)
      }
    }
  }

  constructor() {
    if (!listenerInitialized) {
      this.uncompletedRealmTodos.addListener((todos, changes) => {
        if (!changes || !todos) return
        console.log('\n\n\n\n\n\n\n\n\n\n\n\n\n\n')
        console.log(changes)
        if (!this.lastArrayInitialized) {
          this.lastArrayInitialized = true
          this.lastArray = parse(stringify(todos))
        }
        if (this.draggingEdit) {
          this.draggingEdit = false
          return
        }

        const insertions = changes.insertions
        const deletions = changes.deletions
        const modifications = changes.modifications
        if (modifications.length) {
          for (const modificactionIndex of modifications) {
            const modifiedTodo = todos[modificactionIndex]
            const modifiedTempSync =
              modifiedTodo._tempSyncId || modifiedTodo._id
            if (!modifiedTempSync) continue
            const previousDate = this.mapOfAllDates.get(modifiedTempSync)
            // remove todo if already exists
            if (previousDate && this.initializedMap[previousDate]) {
              // insert todo in title
              this.initializedMap[previousDate].data = this.removeTodoFromArray(
                this.initializedMap[previousDate].data,
                modifiedTempSync
              )
            }
            // insertion part
            const newDate = getTitle(modifiedTodo)
            if (this.initializedMap[newDate]) {
              this.initializedMap[newDate].data = this.removeTodoFromArray(
                this.initializedMap[newDate].data,
                modifiedTempSync
              )
            }
            // if title doesnt exist, we're creating a new one
            if (!this.initializedMap[newDate]) {
              this.initializedMap = insertBetweenTitles(
                this.initializedMap,
                newDate,
                mobxRealmObject(modifiedTodo)
              )
            } else {
              this.insertTodo(this.initializedMap[newDate].data, modifiedTodo)
            }
            this.mapOfAllDates.set(modifiedTempSync, newDate)
          }
        }

        if (deletions.length) {
          for (const deletionIndex of deletions) {
            if (!this.lastArray?.length) break
            const deletedTodo = this.lastArray[deletionIndex]
            const deletedTempSync = deletedTodo._tempSyncId || deletedTodo._id
            if (!deletedTempSync) continue
            const previousDate = this.mapOfAllDates.get(deletedTempSync)
            if (!previousDate || !this.initializedMap[previousDate]) continue
            this.initializedMap[previousDate].data = this.removeTodoFromArray(
              this.initializedMap[previousDate].data,
              deletedTempSync
            )
          }
        }

        if (insertions.length) {
          for (const insertionIndex of insertions) {
            const todo = todos[insertionIndex]
            const title = getTitle(todo)
            const syncId = todo._tempSyncId || todo._id
            if (!syncId) continue
            this.mapOfAllDates.set(syncId, title)
            if (!this.initializedMap[title]) {
              this.initializedMap = insertBetweenTitles(
                this.initializedMap,
                title,
                mobxRealmObject(todo)
              )
              continue
            }
            this.insertTodo(this.initializedMap[title].data, todo)
          }
        }
        const titlesToOmit: string[] = []
        Object.keys(this.initializedMap).forEach((key) => {
          if (!this.initializedMap[key].data.length) {
            titlesToOmit.push(key)
          }
        })
        if (titlesToOmit.length) {
          this.initializedMap = omit(this.initializedMap, titlesToOmit)
        }
        this.key = String(Date.now())
        this.key = String(Date.now())
        this.lastArray = parse(stringify(todos))
      })
      listenerInitialized = true
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

  mapOfAllDates = new Map<string, string>()

  mapFromRealmTodos(
    realmTodos: Realm.Results<Todo> | Todo[],
    completed: boolean,
    hashes?: boolean
  ) {
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
      const id = realmTodo._tempSyncId || realmTodo._id
      if (id) {
        this.mapOfAllDates.set(id, realmTodoTitle)
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
          const newTitle = getTitle(todo)
          todo._exactDate = new Date(newTitle)
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

      const draggingFrogs =
        dataArr[from].frog &&
        dataArr[to].frog &&
        (dataArr[from - 1].frog || !dataArr[from - 1].text)

      const halfFrog =
        dataArr[from].frog ||
        dataArr[to].frog ||
        (dataArr[to + 1] && dataArr[to + 1].frog) ||
        (dataArr[from - 1] && dataArr[from - 1].frog) ||
        (dataArr[from].frog && dataArr[to].frog && !dataArr[to - 1].frog)

      if (!draggingFrogs && halfFrog) {
        this.key = String(Date.now())
        this.key = String(Date.now())
        sharedAppStateStore.changeLoading(false)
        return
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
