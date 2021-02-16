import { TodoSection } from '@views/planning/TodoSection'
import { TodoSectionMap } from '@views/planning/TodoSectionMap'
import { realm } from '@utils/realm'
import { Todo, getTitle } from '@models/Todo'
import { makeObservable, reaction } from 'mobx'
import { mobxRealmObject } from '@utils/mobx-realm/object'
import { debounce, intersection, omit } from 'lodash'
import { observable } from 'mobx'
import { sharedAppStateStore } from '@stores/AppStateStore'
import { SectionListData } from 'react-native'

export class RealmTodosData {
  completed: boolean

  private todos: Realm.Results<Todo>
  private todoSectionMap: TodoSectionMap
  private todoIdToDateMap: Map<string, string>
  private todoIds: string[] | undefined

  @observable invalidationKey = ''

  @observable offset = 50

  get todosArray() {
    const observableKey = this.invalidationKey
    return Object.keys(this.todoSectionMap).map((key) => {
      const originalSectionData = this.todoSectionMap[key] as TodoSection
      const copiedSectionData = { ...originalSectionData }
      copiedSectionData.data = copiedSectionData.data.slice()
      return copiedSectionData
    })
  }

  get allTodosAndHash() {
    if (sharedAppStateStore.hash.length) {
      const hashes = sharedAppStateStore.hash
        .map((hash) => `text CONTAINS[c] "${hash}"`)
        .join(' AND ')
      const neededTodos = this.todos.filtered(hashes)
      const { todoSectionMap } = mapsFromRealmTodos(neededTodos)
      return Object.keys(todoSectionMap).map((key) => todoSectionMap[key])
    } else if (sharedAppStateStore.searchQuery) {
      sharedAppStateStore.changeLoading(true)
      const neededTodos = this.todos.filtered(
        `${`text CONTAINS[c] "${sharedAppStateStore.searchQuery}"`}`
      )
      const { todoSectionMap } = mapsFromRealmTodos(neededTodos)
      const queryTodosMap = Object.keys(todoSectionMap).map(
        (key) => todoSectionMap[key]
      )
      setTimeout(() => sharedAppStateStore.changeLoading(false))
      return queryTodosMap
    }
  }

  private mergeWithOffset = (
    intersectionArr: string[],
    itemsToAdd: TodoSectionMap,
    toAddTo: TodoSectionMap
  ) => {
    intersectionArr.forEach((title) => {
      toAddTo[title].data = [...toAddTo[title].data, ...itemsToAdd[title].data]
    })
  }

  updateInvalidationKeys() {
    // Update invalidation key
    this.invalidationKey = String(Date.now())
    this.invalidationKey = String(Date.now())
  }

  debouncedUpdateKeys = debounce(this.updateInvalidationKeys, 50, {
    maxWait: 250,
  })

  constructor(completed: boolean) {
    makeObservable(this)

    this.completed = completed

    this.todos = getRealmTodos(this.completed)
    const { todoSectionMap, todoIdToDateMap } = mapsFromRealmTodos(
      this.todos.slice(0, this.offset)
    )
    this.todoSectionMap = todoSectionMap
    this.todoIdToDateMap = todoIdToDateMap

    // Trigger when offset is changed
    reaction(
      () => this.offset,
      () => {
        // Get new map with offset
        const { todoSectionMap, todoIdToDateMap } = mapsFromRealmTodos(
          this.todos.slice(this.offset - 50, this.offset)
        )
        this.todoIdToDateMap = new Map([
          ...this.todoIdToDateMap,
          ...todoIdToDateMap,
        ])
        const todoSectionKeys = Object.keys(todoSectionMap)
        // Get intersections between current and new map to check if we need deep merge
        const intersectedTitles = intersection(
          todoSectionKeys,
          Object.keys(this.todoSectionMap)
        )
        // Shallow merge if no intesections (we just dont need deep merge)
        if (!intersectedTitles.length && todoSectionKeys.length) {
          Object.assign(this.todoSectionMap, todoSectionMap)
        } else if (intersectedTitles.length !== todoSectionKeys.length) {
          // Check if we need to do both, deep merge for one part and shallow for another
          const omittedObject = omit(todoSectionMap, intersectedTitles)
          this.mergeWithOffset(
            intersectedTitles,
            todoSectionMap,
            this.todoSectionMap
          )
          Object.assign(this.todoSectionMap, omittedObject)
        } else {
          // If we need only deep merge
          this.mergeWithOffset(
            intersectedTitles,
            todoSectionMap,
            this.todoSectionMap
          )
        }
        this.todoIds = getArrayOfTodoIds(this.todos.slice(0, this.offset))
        // Update invalidation key
        this.invalidationKey = String(Date.now())
        this.invalidationKey = String(Date.now())
      }
    )

    this.todos.addListener((_, changes) => {
      this.realmListener.apply(this, [
        this.todos.slice(0, this.offset),
        changes,
      ])
      this.todoIds = getArrayOfTodoIds(
        this.todos.slice(0, this.offset)
      ) as string[]
      // Remove sections without todos
      const titlesToOmit: string[] = []
      Object.keys(this.todoSectionMap).forEach((key) => {
        if (!this.todoSectionMap[key].data.length) {
          titlesToOmit.push(key)
        }
      })
      if (titlesToOmit.length) {
        this.todoSectionMap = omit(this.todoSectionMap, titlesToOmit)
      }
      // Update invalidation key
      this.debouncedUpdateKeys()
    })
  }

  private realmListener(todos: Todo[], changes: Realm.CollectionChangeSet) {
    // Check if there are no changes
    if (!changes || !todos) {
      return
    }
    if (
      !changes.insertions.length &&
      !changes.deletions.length &&
      !changes.modifications.length &&
      !changes.newModifications.length
    ) {
      return
    }
    // Get changes
    const { insertions, deletions, modifications, newModifications } = changes
    // check if there's an item outside of border
    const outsideOfBorder = !!modifications.find(
      (index) => index >= todos.length
    )
    const modificationsTogether = new Set([
      ...modifications,
      ...newModifications,
    ])
    // Deal with modifications
    for (const modificactionIndex of modificationsTogether) {
      if (!this.todoIds) break
      // Get todo and its id
      const modifiedTodo = outsideOfBorder
        ? todos[modificactionIndex - 1]
        : todos[modificactionIndex]
      const modifiedTodoId = modifiedTodo
        ? modifiedTodo._tempSyncId || modifiedTodo._id
        : this.todoIds[modificactionIndex - 1]
      // Check if id is there
      if (!modifiedTodoId) {
        continue
      }
      // Get previous todo title
      const previousDate = this.todoIdToDateMap.get(modifiedTodoId)
      // Remove todo if it already exists
      if (previousDate) {
        const todoSection = this.todoSectionMap[previousDate]
        if (todoSection) {
          todoSection.data = this.removeTodoFromArray(
            todoSection.data,
            modifiedTodoId
          )
        }
      }
      // Check insertions to prevent double-insert
      if (insertions && !insertions.includes(modificactionIndex)) {
        // Insert todo back
        if (modifiedTodo) {
          const newDate = getTitle(modifiedTodo)
          const todoSection = this.todoSectionMap[newDate]
          if (todoSection) {
            this.insertTodoToArray(todoSection.data, modifiedTodo)
          } else {
            this.todoSectionMap = this.insertBetweenTitles(
              this.todoSectionMap,
              newDate,
              mobxRealmObject(modifiedTodo),
              this.completed
            )
          }
          // Update todo id map
          this.todoIdToDateMap.set(modifiedTodoId, newDate)
        }
      }
    }
    // Deal with deletions
    for (const deletionIndex of deletions) {
      // A hack to silence the typing issues below when compiler thinks that todoIds can still be undefined
      if (!this.todoIds) {
        break
      }
      // Get deleted todo and its id
      const deletedTodoId = this.todoIds[deletionIndex]
      // Check if id is there
      if (!deletedTodoId) {
        continue
      }
      // Get previous todo title
      const previousDate = this.todoIdToDateMap.get(deletedTodoId)
      // Remove todo
      if (previousDate) {
        const todoSection = this.todoSectionMap[previousDate]
        if (todoSection) {
          todoSection.data = this.removeTodoFromArray(
            todoSection.data,
            deletedTodoId
          )
        }
        this.todoIdToDateMap.delete(deletedTodoId)
      }
    }
    // Deal with insertions
    for (const insertionIndex of insertions) {
      if (
        !(todos && todos.length) ||
        insertionIndex === undefined ||
        insertionIndex > todos.length
      )
        continue
      // Get inserted todo, its title and id
      const insertedTodo = todos[insertionIndex]
      const insertedTodoTitle = getTitle(insertedTodo)
      const insertedTodoId = insertedTodo._tempSyncId || insertedTodo._id
      // Check if id is there
      if (!insertedTodoId) {
        continue
      }
      // Insert todo
      const todoSection = this.todoSectionMap[insertedTodoTitle]
      if (todoSection) {
        this.insertTodoToArray(todoSection.data, insertedTodo)
      } else {
        this.todoSectionMap = this.insertBetweenTitles(
          this.todoSectionMap,
          insertedTodoTitle,
          mobxRealmObject(insertedTodo),
          this.completed
        )
      }
      // Update dates map
      this.todoIdToDateMap.set(insertedTodoId, insertedTodoTitle)
    }
  }

  private removeTodoFromArray(array: Todo[], id: string) {
    return array.filter((todo) => (todo._tempSyncId || todo._id) !== id)
  }

  private insertTodoToArray(todoArr: Todo[], todoToBeInserted: Todo) {
    if (todoToBeInserted.frog) {
      const length = todoArr.length
      let added = false
      for (let i = 0; i < length; i++) {
        const lastTodo = todoArr[i]
        if (lastTodo.frog && lastTodo.order < todoToBeInserted.order) {
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
      const orderWithinBounds = todoArr.length > todoToBeInserted.order
      // prevent inserting non-frog todo at frog place
      if (
        orderWithinBounds &&
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
          if (!todoArr[frogCounter - 1].frog) {
            todoArr.splice(frogCounter - 1, 0, todoToBeInserted)
          } else {
            todoArr.splice(frogCounter, 0, todoToBeInserted)
          }
          added = true
          break
        }
        if (!added) {
          todoArr.splice(todoArr.length, 0, todoToBeInserted)
        }
      } else {
        if (orderWithinBounds) {
          todoArr.splice(todoToBeInserted.order, 0, todoToBeInserted)
        } else {
          todoArr.push(todoToBeInserted)
        }
      }
    }
  }

  increaseOffset() {
    if (this.offset < this.todos.length) {
      this.offset += 50
    }
  }

  private insertBetweenTitles(
    originalObject: { [index: string]: TodoSection },
    titleToInsert: string,
    todoToBeInserted: Todo,
    completed: boolean
  ) {
    const newObject = {} as TodoSectionMap

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
}

function getRealmTodos(completed: boolean) {
  return realm
    .objects(Todo)
    .filtered('userName = null')
    .filtered('deleted = false')
    .filtered('delegateAccepted != false')
    .filtered(`completed = ${completed ? 'true' : 'false'}`)
    .sorted([
      ['_exactDate', completed],
      ['frog', true],
      ['order', false],
    ])
}

function mapsFromRealmTodos(realmTodos: Realm.Results<Todo> | Todo[]) {
  const todoSectionMap = {} as TodoSectionMap
  const todoIdToDateMap = new Map<string, string>()

  let currentTitle: string | undefined
  let sectionIndex = 0
  for (const realmTodo of realmTodos) {
    const realmTodoTitle = getTitle(realmTodo)
    if (currentTitle && currentTitle !== realmTodoTitle) {
      sectionIndex++
    }
    if (todoSectionMap[realmTodoTitle]) {
      todoSectionMap[realmTodoTitle].data.push(mobxRealmObject(realmTodo))
    } else {
      todoSectionMap[realmTodoTitle] = {
        order: sectionIndex,
        section: realmTodoTitle,
        data: [mobxRealmObject(realmTodo)],
      }
    }
    const id = realmTodo._tempSyncId || realmTodo._id
    if (id) {
      todoIdToDateMap.set(id, realmTodoTitle)
    }
  }
  return {
    todoSectionMap,
    todoIdToDateMap,
  }
}

function getArrayOfTodoIds(todoArr: Todo[]) {
  return (todoArr.map(
    (todo) => todo._tempSyncId || todo._id
  ) as any) as string[]
}
