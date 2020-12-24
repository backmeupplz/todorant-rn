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
  todoToBeInserted: Todo,
  completed: boolean
) {
  const newObject = {} as { [index: string]: TodoSection }

  const titleToInsertDate = new Date(titleToInsert)

  let added = false

  const allTitles = Object.keys(originalObject)
  for (const titleIndex of allTitles) {
    const indexedTitleDate = new Date(titleIndex)
    if (
      (completed
        ? indexedTitleDate.getTime() < titleToInsertDate.getTime()
        : indexedTitleDate.getTime() > titleToInsertDate.getTime()) &&
      !added
    ) {
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
  lastCompletedArray: undefined | Todo[]

  lastArrayInitialized = false
  lastCompletedArrayInitialized = false

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
        let added = false
        for (
          let frogCounter = todoToBeInserted.order;
          frogCounter < todoArr.length;
          frogCounter++
        ) {
          if (todoArr[frogCounter].frog) continue
          todoArr.splice(frogCounter, 0, todoToBeInserted)
          added = true
          break
        }
        if (!added) {
          todoArr.splice(todoArr.length, 0, todoToBeInserted)
        }
      } else {
        todoArr.splice(todoToBeInserted.order, 0, todoToBeInserted)
      }
    }
  }

  private eventChanger = (
    todos: Realm.Collection<Todo>,
    changes: Realm.CollectionChangeSet,
    lastArrayInitName: string,
    lastArrayName: string,
    mapOfAllDatesName: string,
    initializedMapName: string,
    keyName: string,
    completed: boolean,
    thisArg: any
  ) => {
    if (!thisArg[lastArrayInitName]) {
      thisArg[lastArrayInitName] = true
      thisArg[lastArrayName] = parse(stringify(todos))
    }
    if (!completed && thisArg['draggingEdit']) {
      thisArg['draggingEdit'] = false
      return
    }

    const { insertions, deletions, modifications } = changes

    if (modifications.length) {
      for (const modificactionIndex of modifications) {
        const modifiedTodo = todos[modificactionIndex]
        const modifiedTempSync = modifiedTodo._tempSyncId || modifiedTodo._id
        if (!modifiedTempSync) continue
        const previousDate = thisArg[mapOfAllDatesName].get(modifiedTempSync)
        // remove todo if already exists
        if (previousDate && thisArg[initializedMapName][previousDate]) {
          // insert todo in title
          thisArg[initializedMapName][
            previousDate
          ].data = this.removeTodoFromArray(
            thisArg[initializedMapName][previousDate].data,
            modifiedTempSync
          )
        }
        // insertion part
        const newDate = getTitle(modifiedTodo)
        if (thisArg[initializedMapName][newDate]) {
          thisArg[initializedMapName][newDate].data = this.removeTodoFromArray(
            thisArg[initializedMapName][newDate].data,
            modifiedTempSync
          )
        }
        // if title doesnt exist, we're creating a new one
        if (!thisArg[initializedMapName][newDate]) {
          thisArg[initializedMapName] = insertBetweenTitles(
            thisArg[initializedMapName],
            newDate,
            mobxRealmObject(modifiedTodo),
            completed
          )
        } else {
          this.insertTodo(
            thisArg[initializedMapName][newDate].data,
            modifiedTodo
          )
        }
        thisArg[mapOfAllDatesName].set(modifiedTempSync, newDate)
      }
    }

    if (deletions.length) {
      for (const deletionIndex of deletions) {
        if (!thisArg[lastArrayName]?.length) break
        const deletedTodo = thisArg[lastArrayName][deletionIndex]
        const deletedTempSync = deletedTodo._tempSyncId || deletedTodo._id
        if (!deletedTempSync) continue
        const previousDate = thisArg[mapOfAllDatesName].get(deletedTempSync)
        if (!previousDate || !thisArg[initializedMapName][previousDate])
          continue
        thisArg[initializedMapName][
          previousDate
        ].data = this.removeTodoFromArray(
          thisArg[initializedMapName][previousDate].data,
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
        thisArg[mapOfAllDatesName].set(syncId, title)
        if (!thisArg[initializedMapName][title]) {
          thisArg[initializedMapName] = insertBetweenTitles(
            thisArg[initializedMapName],
            title,
            mobxRealmObject(todo),
            completed
          )
          continue
        }
        this.insertTodo(thisArg[initializedMapName][title].data, todo)
      }
    }

    const titlesToOmit: string[] = []
    Object.keys(thisArg[initializedMapName]).forEach((key) => {
      if (!thisArg[initializedMapName][key].data.length) {
        titlesToOmit.push(key)
      }
    })
    if (titlesToOmit.length) {
      thisArg[initializedMapName] = omit(
        thisArg[initializedMapName],
        titlesToOmit
      )
    }
    thisArg[keyName] = String(Date.now())
    thisArg[keyName] = String(Date.now())
    thisArg[lastArrayName] = parse(stringify(todos))
  }

  constructor() {
    this.completedRealmTodos.addListener((todos, changes) => {
      if (!changes || !todos) return
      if (
        ![...changes.insertions, ...changes.deletions, ...changes.modifications]
          .length
      )
        return

      this.eventChanger(
        todos,
        changes,
        'lastCompletedArrayInitialized',
        'lastCompletedArray',
        'completedMapOfAllDates',
        'initializedCompletedMap',
        'completedKey',
        true,
        this
      )
    })
    this.uncompletedRealmTodos.addListener((todos, changes) => {
      if (!changes || !todos) return
      this.eventChanger(
        todos,
        changes,
        'lastArrayInitialized',
        'lastArray',
        'mapOfAllDates',
        'initializedMap',
        'uncompletedKey',
        false,
        this
      )
    })
  }

  @observable uncompletedKey = ''
  @observable completedKey = ''

  @computed get uncompletedTrackingKey() {
    return this.uncompletedKey
  }

  @computed get completedTrackingKey() {
    return this.completedKey
  }

  todosAndIndexes = {} as any

  @computed get uncompletedTodosMap() {
    console.log('Got uncompletedTodosMap')
    const key = this.uncompletedTrackingKey
    return this.initialized
      ? this.initializedMap
      : this.mapFromRealmTodos(this.uncompletedRealmTodos, false)
  }

  @computed get uncompletedTodosArray() {
    console.log('Got uncompletedTodosArray')
    const key = this.uncompletedTrackingKey
    return Object.keys(this.uncompletedTodosMap).map(
      (key) => this.uncompletedTodosMap[key]
    )
  }

  @computed get completedTodosMap() {
    return this.initializedCompleted
      ? this.initializedCompletedMap
      : this.mapFromRealmTodos(this.completedRealmTodos, true)
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
  completedMapOfAllDates = new Map<string, string>()

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
        if (completed) {
          this.completedMapOfAllDates.set(id, realmTodoTitle)
        } else {
          this.mapOfAllDates.set(id, realmTodoTitle)
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
        this.uncompletedKey = String(Date.now())
        this.uncompletedKey = String(Date.now())
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
    this.uncompletedKey = String(Date.now())
    this.uncompletedKey = String(Date.now())
    sharedAppStateStore.changeLoading(false)
    sockets.todoSyncManager.sync()
  }
}
