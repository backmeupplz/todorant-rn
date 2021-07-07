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
import { hydration } from './hydration/hydratedStores'
import { Results } from 'realm'
import { DelegationUser } from '@models/DelegationUser'
import { SectionListData } from 'react-native'
import { MelonTodo } from '@models/MelonTodo'
import { Q } from '@nozbe/watermelondb'
import { database, todosCollection } from '@utils/wmdb'
import { Subscription } from 'rxjs'

class TodoStore {
  hydrated = false
  @observable observableKey = 0

  @persist('date') @observable updatedAt?: Date

  getDelegationTodos(byMe: boolean, completed = false) {
    let todosWithoutDelegationPredicate = realm
      .objects(Todo)
      .filtered('deleted = false')
      .filtered('delegator != null')
      .filtered(`completed = ${completed}`)

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

  getTodos(title: string, completed: boolean) {
    console.log(title)
    const dateQuery =
      title.length === 10
        ? Q.where('date', title.substr(8, 2))
        : Q.or(Q.where('date', ''), Q.where('date', Q.eq(null)))
    // if (sharedSessionStore && sharedSessionStore.hydrated) {
    //   realmResultsWithoutDelegation = realmResultsWithoutDelegation.filtered(
    //     `delegator._id != "${sharedSessionStore.user?._id}"`
    //   )
    // }
    return todosCollection.query(
      Q.where('is_deleted', false),
      Q.where('is_delegate_accepted', Q.notEq(false)),
      Q.where('is_completed', completed),
      Q.where('month_and_year', title.substr(0, 7)),
      dateQuery,
      Q.experimentalSortBy('is_frog', Q.desc),
      Q.experimentalSortBy('order', Q.asc)
    )
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
    const dateQuery =
      title.length === 10
        ? Q.where('date', title.substr(8, 2))
        : Q.or(Q.where('date', ''), Q.where('date', Q.eq(null)))

    return todosCollection.query(
      Q.where('is_deleted', false),
      Q.where('is_delegate_accepted', Q.notEq(false)),
      Q.where('month_and_year', title.substr(0, 7)),
      dateQuery,
      Q.experimentalSortBy('order', Q.asc)
    )
  }

  todosForDate1 = (title: string) => {
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
    if (hydration.isHydrated && sharedSessionStore.user?._id) {
      realmResultsWithoutDelegation = realmResultsWithoutDelegation
        .filtered(`user = null || user._id = "${sharedSessionStore.user?._id}"`)
        .filtered(
          'delegator = null || (delegator != null && delegateAccepted = true)'
        )
    }
    return realmResultsWithoutDelegation
  }

  @computed get currentTodo() {
    return this.shallowTodayUncompletedTodos.length
      ? mobxRealmObject(this.shallowTodayUncompletedTodos[0])
      : undefined
  }

  @computed get delegatedByMe() {
    return this.getDelegationTodos(true)
  }
  @computed get delegatedByMeCompleted() {
    return this.getDelegationTodos(true, true)
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

  @computed get delegatedByMeCompletedTodosMap() {
    const key = this.observableKey
    const delegatedByMeMap = this.getDelegatedTodosMap(
      this.delegatedByMeCompleted,
      true
    )
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

  todayUncompletedTodos = this.getTodos(observableNow.todayTitle, false)
  todayCompletedTodos = this.getTodos(observableNow.todayTitle, true)

  @computed get progress() {
    return {
      count: this.uncompletedTodayAmount + this.completedTodayAmount,
      completed: this.completedTodayAmount,
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

  @observable uncompletedTodayAmount = 0
  @observable completedTodayAmount = 0

  currentSubscription?: Subscription

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
        this.todayUncompletedTodos = this.getTodos(
          observableNow.todayTitle,
          false
        )
      }
    )
    this.todayCompletedTodos
      .observe()
      .subscribe((amount) => (this.completedTodayAmount = amount.length))
    this.currentSubscription = this.todayUncompletedTodos
      .observe()
      .subscribe((amount) => (this.uncompletedTodayAmount = amount.length))
  }

  logout = () => {
    this.updatedAt = undefined
    this.refreshTodos()
  }

  refreshTodos = () => {
    refreshWidgetAndBadgeAndWatch()
  }

  async recalculateExactDates() {
    const todos = await todosCollection.query().fetch()
    const toUpdate = [] as MelonTodo[]

    for (const todo of todos) {
      toUpdate.push(
        todo.prepareUpdate(
          (todoToUpdate) => (todoToUpdate._exactDate = new Date(getTitle(todo)))
        )
      )
    }
    await database.write(async () => await database.batch(...toUpdate))
  }
}

export const sharedTodoStore = new TodoStore()
hydrate('TodoStore', sharedTodoStore).then(async () => {
  sharedTodoStore.hydrated = true
  hydrateStore('TodoStore')
})
