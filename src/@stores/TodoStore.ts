import { hydrate } from '@stores/hydration/hydrate'
import { hydrateStore } from '@stores/hydration/hydrateStore'
import {
  observableNowEventEmitter,
  ObservableNowEventEmitterEvent,
} from '@utils/ObservableNow'
import { observableNow } from '@utils/ObservableNow'
import { getTitle } from '@models/Todo'
import { refreshWidgetAndBadgeAndWatch } from '@utils/refreshWidgetAndBadgeAndWatch'
import { computed, makeObservable, observable, when } from 'mobx'
import { persist } from 'mobx-persist'
import { sharedOnboardingStore } from '@stores/OnboardingStore'
import { sharedSessionStore } from './SessionStore'
import { hydration } from './hydration/hydratedStores'
import { MelonTodo } from '@models/MelonTodo'
import { Q, Query } from '@nozbe/watermelondb'
import { database, todosCollection, usersCollection } from '@utils/wmdb'
import { Subscription } from 'rxjs'
import { TodoColumn, UserColumn } from '@utils/melondb'

class TodoStore {
  hydrated = false
  @observable observableKey = 0

  @persist('date') @observable updatedAt?: Date

  undeletedTodos = todosCollection.query(Q.where(TodoColumn.deleted, false))
  undeletedUncompleted = this.undeletedTodos.extend(
    Q.where(TodoColumn.completed, false)
  )

  wmdbUserId?: string
  wmdbUserAsDelegatorId?: string

  async getWmDbUser(delegator: boolean) {
    return (
      await usersCollection
        .query(
          Q.where(UserColumn._id, sharedSessionStore.user?._id || null),
          Q.where(UserColumn.isDelegator, delegator)
        )
        .fetch()
    )[0].id
  }

  getDelegationTodos(byMe: boolean, completed = false) {
    const query = !byMe
      ? Q.and(
          Q.where(TodoColumn.delegateAccepted, Q.notEq(true)),
          Q.where(TodoColumn.user, this.wmdbUserId || null)
        )
      : Q.where(TodoColumn.delegator, this.wmdbUserAsDelegatorId || null)
    return this.undeletedTodos.extend(
      Q.where(TodoColumn.delegator, Q.notEq(null)),
      Q.where(TodoColumn.completed, completed),
      query
    )
  }

  getTodos(title: string, completed: boolean) {
    const dateQuery =
      title.length === 10
        ? Q.where(TodoColumn.date, title.substr(8, 2))
        : Q.or(
            Q.where(TodoColumn.date, ''),
            Q.where(TodoColumn.date, Q.eq(null))
          )
    return todosCollection.query(
      Q.where(TodoColumn.deleted, false),
      Q.where(TodoColumn.delegateAccepted, Q.notEq(false)),
      Q.where(TodoColumn.completed, completed),
      Q.where(TodoColumn.monthAndYear, title.substr(0, 7)),
      dateQuery,
      Q.where(
        TodoColumn.delegator,
        this.wmdbUserAsDelegatorId ? Q.notEq(this.wmdbUserAsDelegatorId) : null
      ),
      Q.experimentalSortBy(TodoColumn.frog, Q.desc),
      Q.experimentalSortBy(TodoColumn.order, Q.asc)
    )
  }

  todosForDate = (title: string) => {
    const dateQuery =
      title.length === 10
        ? Q.where(TodoColumn.date, title.substr(8, 2))
        : Q.or(
            Q.where(TodoColumn.date, ''),
            Q.where(TodoColumn.date, Q.eq(null))
          )
    return todosCollection.query(
      Q.where(TodoColumn.deleted, false),
      Q.where(TodoColumn.delegateAccepted, Q.notEq(false)),
      Q.where(TodoColumn.monthAndYear, title.substr(0, 7)),
      dateQuery,
      Q.experimentalSortBy(TodoColumn.order, Q.asc)
    )
  }

  todosBeforeDate = (title: string) => {
    const todayWithTimezoneOffset = new Date(title)
    let realmResultsWithoutDelegation = todosCollection.query(
      Q.where(TodoColumn.deleted, false),
      Q.where(TodoColumn.completed, false),
      Q.where(TodoColumn._exactDate, Q.lt(todayWithTimezoneOffset.getTime())),
      Q.or(
        Q.where(TodoColumn.user, null),
        Q.where(TodoColumn.user, this.wmdbUserId || null)
      ),
      Q.or(
        Q.where(TodoColumn.delegator, null),
        Q.and(
          Q.where(TodoColumn.delegator, Q.notEq(null)),
          Q.where(TodoColumn.delegateAccepted, true)
        )
      )
    )
    return realmResultsWithoutDelegation
  }

  delegatedByMe?: Query<MelonTodo>

  delegatedByMeCompleted?: Query<MelonTodo>

  delegatedToMe?: Query<MelonTodo>

  @observable todayUncompletedTodos?: Query<MelonTodo>

  @observable todayCompletedTodos?: Query<MelonTodo>

  @computed get progress() {
    return {
      count: this.uncompletedTodayAmount + this.completedTodayAmount,
      completed: this.completedTodayAmount,
    }
  }

  @observable oldTodosCount = 0

  @computed get isPlanningRequired() {
    return !!this.oldTodosCount && sharedOnboardingStore.tutorialIsShown
  }

  @observable incompleteFrogsExist = 0

  @observable uncompletedTodayAmount = 0
  @observable completedTodayAmount = 0

  @observable delegatedToMeCount = 0
  @observable delegatedByMeCount = 0
  @observable delegatedByMeCompletedCount = 0

  currentSubscription?: Subscription

  oldTodosSubscribtion?: Subscription

  subscribeOldTodos() {
    this.oldTodosSubscribtion?.unsubscribe()
    this.oldTodosSubscribtion = this.todosBeforeDate(observableNow.todayTitle)
      .observeCount(false)
      .subscribe((count) => (this.oldTodosCount = count))
  }

  constructor() {
    makeObservable(this)
    this.refreshTodos()
    // Today date changed
    observableNowEventEmitter.on(
      ObservableNowEventEmitterEvent.ObservableNowChanged,
      () => {
        this.subscribeOldTodos()

        this.todayUncompletedTodos = this.getTodos(
          observableNow.todayTitle,
          false
        )
        this.todayUncompletedTodos
          .extend(Q.where(TodoColumn.frog, true))
          .observeCount(false)
          .subscribe((count) => (this.incompleteFrogsExist = count))
      }
    )
    this.initDelegation()
  }

  async initDelegation() {
    await when(() => hydration.isHydrated)

    this.wmdbUserId = await this.getWmDbUser(false)
    this.wmdbUserAsDelegatorId = await this.getWmDbUser(true)

    this.todayUncompletedTodos = this.getTodos(observableNow.todayTitle, false)
    this.todayCompletedTodos = this.getTodos(observableNow.todayTitle, true)

    this.delegatedByMe = this.getDelegationTodos(true)
    this.delegatedByMeCompleted = this.getDelegationTodos(true, true)
    this.delegatedToMe = this.getDelegationTodos(false)
    this.todayCompletedTodos
      .observeCount(false)
      .subscribe((amount) => (this.completedTodayAmount = amount))
    this.currentSubscription = this.todayUncompletedTodos
      .observeCount(false)
      .subscribe((amount) => (this.uncompletedTodayAmount = amount))

    this.delegatedToMe
      .observeCount(false)
      .subscribe((count) => (this.delegatedToMeCount = count))
    this.delegatedByMe
      .observeCount(false)
      .subscribe((count) => (this.delegatedByMeCount = count))
    this.delegatedByMeCompleted
      .observeCount(false)
      .subscribe((count) => (this.delegatedByMeCompletedCount = count))

    this.subscribeOldTodos()
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
