import { mobxRealmObject } from '@utils/mobx-realm/object'
import { omit } from 'lodash'
import { getTitle, Todo } from '@models/Todo'
import { sharedAppStateStore, TodoSectionType } from '@stores/AppStateStore'
import { realm } from '@utils/realm'
import { getDateDateString, getDateMonthAndYearString } from '@utils/time'
import { computed, observable } from 'mobx'

let key = {}

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

  @observable key = ''

  @computed get completedTodosMap() {
    return this.mapFromRealmTodos(this.completedRealmTodos, true)
  }

  @computed get theoreticalKey() {
    return this.key
  }

  @computed get uncompletedTodosMap() {
    console.log('Got uncompletedTodosMap')
    if (!this.listenerInitialized) {
      this.uncompletedRealmTodos.addListener((todos, changes) => {
        if (!this.lastArrayInitialized) {
          this.lastArrayInitialized = true
          this.lastArray = [...todos]
        }

        if (this.draggingEdit) {
          this.draggingEdit = false
          return
        }

        const insertions = changes.insertions
        const deletions = changes.deletions

        if (sharedAppStateStore.skipping) {
          // task skip
          const titleDate = new Date()
          const title = titleDate.toISOString().slice(0, 10)
          const tempTodayDataArr = this.initializedMap[title].data.slice(0)
          const firstTodo = tempTodayDataArr[0]
          this.initializedMap[title].data.splice(0, 1)
          this.initializedMap[title].data.splice(
            this.initializedMap[title].data.length,
            0,
            firstTodo
          )
          sharedAppStateStore.skipping = false
        }

        if (insertions.length) {
          // insertions
          for (const insertIndex of insertions) {
            const todo = todos[insertIndex]
            const title = getTitle(todos[insertIndex])
            if (!this.initializedMap[title]) {
              this.initializedMap[title] = {
                order: 0,
                section: title,
                data: [mobxRealmObject(todo)],
              }
              continue
            }
            if (todo.frog) {
              let lastOrder = -1
              const length = this.initializedMap[title].data.length
              for (let i = 0; i < length; i++) {
                const lastTodo = this.initializedMap[title].data[i]
                if (lastTodo.frog) {
                  lastOrder = lastTodo.order
                  continue
                }
                this.initializedMap[title].data.splice(i, 0, todo)
                break
              }
            } else {
              this.initializedMap[title].data.push(mobxRealmObject(todo))
            }
          }
        }

        if (deletions.length) {
          for (const deletedIndex of deletions) {
            if (!this.lastArray) return
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
        this.lastArray = [...todos]
        this.key = String(Date.now())
      })
      this.listenerInitialized = true
    }
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

  @computed get allTodosAndHash() {
    const hashes = sharedAppStateStore.hash
      .map((hash) => `text CONTAINS[c] "${hash}"`)
      .join(' AND ')
    const neededTodos = this.mapFromRealmTodos(
      this.uncompletedRealmTodos.filtered(hashes),
      false,
      true
    )
    const hashTodosMap = Object.keys(neededTodos).map((key) => neededTodos[key])
    return hashTodosMap
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

  onDragEnd = async ({
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
    const startTIme = Date.now()
    let lastSection: string
    let map = {} as { [index: string]: TodoSection }

    let sectionCounter = -1
    let randomOtherCounter = 0

    const draggingFrogs = dataArr[from].frog && dataArr[to].frog
    const halfFrog = dataArr[from].frog || dataArr[to].frog

    if (!draggingFrogs && halfFrog) {
      this.key = String(Date.now())
      return
    }

    const lo = Math.min(from, to)
    const hi = Math.max(from, to)

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

        if (globalIndex >= lo && globalIndex <= hi) {
          randomOtherCounter++
          dataArrItem.date = getDateDateString(lastSection)
          dataArrItem.monthAndYear = getDateMonthAndYearString(lastSection)
          dataArrItem._exactDate = new Date(lastSection)
          dataArrItem.updatedAt = new Date()
          dataArrItem.order = randomOtherCounter
        }
        map[lastSection].data.push(dataArrItem)
      })
    })

    // remove section if there's no more todos
    Object.keys(map).forEach((key) => {
      if (!map[key].data.length) {
        map = omit(map, [key])
      }
    })
    this.initializedMap = map
    this.key = String(Date.now())
    const timeEnd = Date.now()
    this.draggingEdit = true
  }
}
