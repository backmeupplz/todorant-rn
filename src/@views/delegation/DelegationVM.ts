import { TodoSection } from '@views/planning/TodoSection'
import { TodoSectionMap } from '@views/planning/TodoSectionMap'
import { realm } from '@utils/realm'
import { Todo, getTitle } from '@models/Todo'
import { computed, makeObservable, observable, reaction } from 'mobx'
import { mobxRealmObject } from '@utils/mobx-realm/object'
import { debounce, intersection, omit } from 'lodash'
import { sharedAppStateStore } from '@stores/AppStateStore'
import { SectionListData } from 'react-native'
import {
  observableNowEventEmitter,
  ObservableNowEventEmitterEvent,
} from '@utils/ObservableNow'
import { sharedSessionStore } from '@stores/SessionStore'
import { mobxRealmCollection } from '@utils/mobx-realm/collection'

export class RealmTodosData {
  completed: boolean

  private todos: Realm.Results<Todo>
  private todoSectionMap: TodoSectionMap
  private todoIdToDateMap: Map<string, string>
  private todoIds: string[] | undefined

  @observable invalidationKey = ''

  @observable offset = 50

  @observable andAgainIdk = getRealmTodos(true)

  getDelegatedTodosMap(byMe: boolean) {
    const todoSectionMap = {} as TodoSectionMap

    let currentTitle: string | undefined
    let sectionIndex = 0
    for (const realmTodo of this.andAgainIdk) {
      const realmTodoTitle = realmTodo.delegator?.name
      // if (!realmTodoTitle) return
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
    }
    return todoSectionMap
  }

  // @computed get idkMap() {}

  @computed get todosArray() {
    const observableKey = this.invalidationKey
    const delegatedTodosMap = this.getDelegatedTodosMap(true)
    return Object.keys(delegatedTodosMap).map((key) => {
      return delegatedTodosMap[key] as TodoSection
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

    this.completed = true

    this.todos = getRealmTodos(this.completed)
    const { todoSectionMap, todoIdToDateMap } = mapsFromRealmTodos(this.todos)
    this.todoSectionMap = todoSectionMap
    this.todoIdToDateMap = todoIdToDateMap
  }
}

function getRealmTodos(byMe: boolean) {
  const realmPredicate = byMe
    ? `!= "${sharedSessionStore.user?._id}"`
    : `= "${sharedSessionStore.user?._id}"`

  return mobxRealmCollection(
    realm
      .objects(Todo)
      .filtered('deleted = false')
      .filtered('delegator != null')
      .filtered(`delegator._id ${realmPredicate}`)
      .sorted([
        ['frog', true],
        ['order', false],
      ])
  )
}

function mapsFromRealmTodos(realmTodos: Realm.Results<Todo> | Todo[]) {
  const todoSectionMap = {} as TodoSectionMap
  const todoIdToDateMap = new Map<string, string>()

  let currentTitle: string | undefined
  let sectionIndex = 0
  for (const realmTodo of realmTodos) {
    const realmTodoTitle = realmTodo.delegator?.name
    // if (!realmTodoTitle) return
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
