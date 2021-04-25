import { hydrate } from '@stores/hydration/hydrate'
import { hydrateStore } from '@stores/hydration/hydrateStore'
import { mobxRealmObject } from '@utils/mobx-realm/object'
import {
  observableNowEventEmitter,
  ObservableNowEventEmitterEvent,
} from '@utils/ObservableNow'
import { observableNow } from '@utils/ObservableNow'
import { getTitle, Todo } from '@models/Todo'
import {
  mobxRealmCollection,
  shallowMobxRealmCollection,
} from '@utils/mobx-realm/collection'
import { realm } from '@utils/realm'
import { refreshWidgetAndBadgeAndWatch } from '@utils/refreshWidgetAndBadgeAndWatch'
import { computed, makeObservable, observable } from 'mobx'
import { persist } from 'mobx-persist'
import { sharedOnboardingStore } from '@stores/OnboardingStore'
import { sharedSessionStore } from './SessionStore'
import { isHydrated } from './hydration/hydratedStores'
import { Results } from 'realm'
import { DelegationUser } from '@models/DelegationUser'
import { SectionListData } from 'react-native'

class TodoStore {
  hydrated = false
  @observable observableKey = 0

  @persist('date') @observable updatedAt?: Date

  getDelegationTodos(byMe: boolean) {
    let todosWithoutDelegationPredicate = realm
      .objects(Todo)
      .filtered('deleted = false')
      .filtered('delegator != null')

    if (!byMe) {
      const todosWithDelegationPredicate = todosWithoutDelegationPredicate
        .filtered('delegateAccepted != true')
        .filtered(`user._id = "${sharedSessionStore.user?._id}"`)
      todosWithoutDelegationPredicate = todosWithDelegationPredicate
    } else {
      const todosWithDelegationPredicate = todosWithoutDelegationPredicate.filtered(
        `delegator._id = "${sharedSessionStore.user?._id}"`
      )
      todosWithoutDelegationPredicate = todosWithDelegationPredicate
    }
    return todosWithoutDelegationPredicate
  }

  getRealmTodos(title: string, completed: boolean) {
    let realmResultsWithoutDelegation = realm
      .objects(Todo)
      .filtered('deleted = false')
      .filtered('delegateAccepted != false')
      .filtered(`completed = ${completed ? 'true' : 'false'}`)
      .filtered(
        title.length === 10
          ? `monthAndYear = "${title.substr(0, 7)}" && date = "${title.substr(
              8,
              2
            )}"`
          : `monthAndYear = "${title.substr(
              0,
              7
            )}" && (date == "" || date == null)`
      )
    if (sharedSessionStore && sharedSessionStore.hydrated) {
      realmResultsWithoutDelegation = realmResultsWithoutDelegation.filtered(
        `delegator._id != "${sharedSessionStore.user?._id}"`
      )
    }
    return realmResultsWithoutDelegation.sorted([
      ['frog', true],
      ['order', false],
    ])
  }

  todosForDate = (title: string) => {
    return realm
      .objects(Todo)
      .filtered('deleted = false')
      .filtered('delegateAccepted != false')
      .filtered(
        title.length === 10
          ? `monthAndYear = "${title.substr(0, 7)}" && date = "${title.substr(
              8,
              2
            )}"`
          : `monthAndYear = "${title.substr(
              0,
              7
            )}" && (date == "" || date == null)`
      )
      .sorted('order')
  }

  todosBeforeDate = (title: string) => {
    const todayWithTimezoneOffset = new Date(title)
    const todayString = `T${
      Math.floor(todayWithTimezoneOffset.getTime() / 1000) - 1
    }:000`
    let realmResultsWithoutDelegation = realm
      .objects(Todo)
      .filtered('deleted = false')
      .filtered('completed = false')
      .filtered(`_exactDate < ${todayString}`)
      .filtered('delegateAccepted = true')
    if (isHydrated() && sharedSessionStore.user?._id) {
      realmResultsWithoutDelegation = realmResultsWithoutDelegation.filtered(
        `user._id = "${sharedSessionStore.user?._id}"`
      )
    }
    return realmResultsWithoutDelegation
  }

  @computed get currentTodo() {
    return this.shallowTodayUncompletedTodos.length
      ? mobxRealmObject(this.shallowTodayUncompletedTodos[0])
      : undefined
  }

  @computed get unacceptedTodos() {
    //
    let realmResultsWithoutDelegation = realm
      .objects(Todo)
      .filtered('deleted = false')
      .filtered('delegateAccepted != true')
      .filtered('delegator != null')
    if (isHydrated() && sharedSessionStore.user?._id) {
      realmResultsWithoutDelegation = realmResultsWithoutDelegation.filtered(
        `user._id = "${sharedSessionStore.user?._id}"`
      )
    }
    return mobxRealmCollection(realmResultsWithoutDelegation)
  }

  @computed get delegatedByMe() {
    return this.getDelegationTodos(true)
  }
  @computed get delegatedToMe() {
    return this.getDelegationTodos(false)
  }

  getDelegatedTodosMap(todos: Results<Todo>, byMe: boolean) {
    const todoSectionMap = {} as {
      [key: string]: {
        userInSection: DelegationUser
        data: Todo[]
      }
    }

    let currentTitle: string | undefined
    let sectionIndex = 0
    for (const realmTodo of todos) {
      const user = byMe ? realmTodo.user : realmTodo.delegator
      if (!user) continue
      const titleKey = user?._id
      if (!titleKey) continue
      if (currentTitle && currentTitle !== titleKey) {
        sectionIndex++
      }
      if (todoSectionMap[titleKey]) {
        todoSectionMap[titleKey].data.push(mobxRealmObject(realmTodo))
      } else {
        todoSectionMap[titleKey] = {
          userInSection: user,
          data: [mobxRealmObject(realmTodo)],
        }
      }
    }
    return Object.keys(todoSectionMap).map((key) => {
      return todoSectionMap[key]
    }) as SectionListData<Todo>[]
  }

  @computed get delegatedByMeTodosMap() {
    const key = this.observableKey
    const delegatedByMeMap = this.getDelegatedTodosMap(this.delegatedByMe, true)
    return delegatedByMeMap
  }

  @computed get delegatedToMeTodosMap() {
    const key = this.observableKey
    const delegatedByMeMap = this.getDelegatedTodosMap(
      this.delegatedToMe,
      false
    )
    return delegatedByMeMap
  }

  @observable shallowTodayUncompletedTodos = shallowMobxRealmCollection(
    this.getRealmTodos(observableNow.todayTitle, false)
  )

  @observable shallowTodayCompletedTodos = shallowMobxRealmCollection(
    this.getRealmTodos(observableNow.todayTitle, true)
  )

  @computed get progress() {
    return {
      count:
        this.shallowTodayUncompletedTodos.length +
        this.shallowTodayCompletedTodos.length,
      completed: this.shallowTodayCompletedTodos.length,
    }
  }

  @observable oldTodos = shallowMobxRealmCollection(
    this.todosBeforeDate(observableNow.todayTitle)
  )

  @computed get isPlanningRequired() {
    return !!this.oldTodos.length && sharedOnboardingStore.tutorialIsShown
  }

  @computed get incompleteFrogsExist() {
    const date = observableNow.todayTitle
    return realm
      .objects(Todo)
      .filtered(
        date.length === 10
          ? `monthAndYear = "${date.substr(0, 7)}" && date = "${date.substr(
              8,
              2
            )}"`
          : `monthAndYear = "${date.substr(
              0,
              7
            )}" && (date == "" || date == null)`
      )
      .filtered(
        'deleted = false && delegateAccepted != false && completed = false && frog = true'
      ).length
  }

  constructor() {
    makeObservable(this)
    this.refreshTodos()
    // Today date changed
    observableNowEventEmitter.on(
      ObservableNowEventEmitterEvent.ObservableNowChanged,
      () => {
        this.observableKey = Date.now()
        this.oldTodos = shallowMobxRealmCollection(
          this.todosBeforeDate(observableNow.todayTitle)
        )
        this.shallowTodayUncompletedTodos = shallowMobxRealmCollection(
          this.getRealmTodos(observableNow.todayTitle, false)
        )
        this.shallowTodayCompletedTodos = shallowMobxRealmCollection(
          this.getRealmTodos(observableNow.todayTitle, true)
        )
      }
    )
  }

  logout = () => {
    this.updatedAt = undefined
    this.refreshTodos()
  }

  refreshTodos = () => {
    refreshWidgetAndBadgeAndWatch()
  }

  recalculateExactDates() {
    const todos = realm.objects(Todo)
    realm.write(() => {
      for (const todo of todos) {
        todo._exactDate = new Date(getTitle(todo))
      }
    })
  }
}

export const sharedTodoStore = new TodoStore()
hydrate('TodoStore', sharedTodoStore).then(async () => {
  sharedTodoStore.hydrated = true
  hydrateStore('TodoStore')
})
