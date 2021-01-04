import { TodoSection } from '@views/planning/TodoSection'
import { TodoSectionMap } from '@views/planning/TodoSectionMap'
import { realm } from '@utils/realm'
import { Todo, getTitle } from '@models/Todo'
import { computed } from 'mobx'
import { mobxRealmObject } from '@utils/mobx-realm/object'
import { parse, stringify } from 'flatted'
import { omit } from 'lodash'
import { observable } from 'mobx'

export class RealmTodosData {
  completed: boolean

  private todos: Realm.Results<Todo>
  @observable private todoSectionMap: TodoSectionMap
  private todoIdToDateMap: Map<string, string>
  private lastArray: Todo[] | undefined

  @computed get todosArray() {
    return Object.keys(this.todoSectionMap).map(
      (key) => this.todoSectionMap[key]
    )
  }

  constructor(completed: boolean) {
    this.completed = completed

    this.todos = getRealmTodos(this.completed)
    const { todoSectionMap, todoIdToDateMap } = mapsFromRealmTodos(this.todos)
    this.todoSectionMap = todoSectionMap
    this.todoIdToDateMap = todoIdToDateMap

    this.todos.addListener(this.realmListener)
  }

  private realmListener(
    todos: Realm.Collection<Todo>,
    changes: Realm.CollectionChangeSet
  ) {
    // Check if there are no changes
    if (!changes || !todos) {
      return
    }
    if (
      !changes.insertions.length &&
      !changes.deletions.length &&
      !changes.modifications.length
    ) {
      return
    }
    // Save array of todos for future
    if (!this.lastArray) {
      this.lastArray = parse(stringify(todos))
    }
    // A hack to silence the typing issues below when compiler thinks that lastArray can still be undefined
    if (!this.lastArray) {
      return
    }
    // Get changes
    const { insertions, deletions, modifications } = changes
    // Deal with modifications
    for (const modificactionIndex of modifications) {
      // Get todo and its id
      const modifiedTodo = todos[modificactionIndex]
      const modifiedTodoId = modifiedTodo._tempSyncId || modifiedTodo._id
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
      // Insert todo back
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
    // Deal with deletions
    for (const deletionIndex of deletions) {
      // If there is nothing to delete, just stop
      if (!this.lastArray.length) {
        break
      }
      // Get deleted todo and its id
      const deletedTodo = this.lastArray[deletionIndex]
      const deletedTodoId = deletedTodo._tempSyncId || deletedTodo._id
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
      }
    }
    // Deal with insertions
    for (const insertionIndex of insertions) {
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
    // Update keys and last array
    this.lastArray = parse(stringify(todos))
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
