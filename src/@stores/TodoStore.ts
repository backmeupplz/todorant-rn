import { MelonTodo } from '@models/MelonTodo'
import {
  ObservableNowEventEmitterEvent,
  observableNowEventEmitter,
} from '@utils/ObservableNow'
import { Q, Query } from '@nozbe/watermelondb'
import { Subscription } from 'rxjs'
import { TodoColumn, UserColumn } from '@utils/watermelondb/tables'
import { computed, makeObservable, observable, when } from 'mobx'
import {
  database,
  todosCollection,
  usersCollection,
} from '@utils/watermelondb/wmdb'
import { getTitle } from '@models/Todo'
import { hydrate } from '@stores/hydration/hydrate'
import { hydrateStore } from '@stores/hydration/hydrateStore'
import { hydration } from '@stores/hydration/hydratedStores'
import { observableNow } from '@utils/ObservableNow'
import { persist } from 'mobx-persist'
import { refreshWidgetAndBadgeAndWatch } from '@utils/refreshWidgetAndBadgeAndWatch'
import { sharedOnboardingStore } from '@stores/OnboardingStore'
import { sharedSessionStore } from '@stores/SessionStore'

class TodoStore {
  hydrated = false
  @observable observableKey = 0

  @persist('date') @observable updatedAt?: Date

  @persist isFirstSync = false

  completedTodos = todosCollection.query(Q.where(TodoColumn.completed, true))
  undeletedTodos = todosCollection.query(Q.where(TodoColumn.deleted, false))
  deletedTodos = todosCollection.query(Q.where(TodoColumn.deleted, true))
  undeletedUncompleted = this.undeletedTodos.extend(
    Q.where(TodoColumn.completed, false)
  )
  undeletedCompleted = this.undeletedTodos.extend(
    Q.where(TodoColumn.completed, true)
  )

  wmdbUserId?: string
  wmdbUserAsDelegatorId?: string

  async getWmDbUser(delegator: boolean): Promise<string | undefined> {
    return (
      await usersCollection
        .query(
          Q.where(UserColumn._id, sharedSessionStore.user?._id || null),
          Q.where(UserColumn.isDelegator, delegator)
        )
        .fetch()
    )[0]?.id
  }

  getDelegationTodos(byMe: boolean, completed = false) {
    const query = byMe
      ? Q.where(TodoColumn.delegator, this.wmdbUserAsDelegatorId || null)
      : Q.and(
          Q.where(TodoColumn.delegateAccepted, Q.notEq(!completed)),
          Q.where(TodoColumn.user, this.wmdbUserId || null)
        )
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
    return this.undeletedTodos.extend(
      Q.where(TodoColumn.delegateAccepted, Q.notEq(false)),
      Q.where(TodoColumn.completed, completed),
      Q.where(TodoColumn.monthAndYear, title.substr(0, 7)),
      dateQuery,
      Q.or(
        Q.and(
          Q.where(TodoColumn.delegateAccepted, Q.notEq(true)),
          Q.where(TodoColumn.delegator, null)
        ),
        Q.and(
          Q.where(TodoColumn.delegateAccepted, true),
          Q.where(
            TodoColumn.delegator,
            this.wmdbUserAsDelegatorId
              ? Q.notEq(this.wmdbUserAsDelegatorId)
              : null
          )
        )
      ),
      Q.sortBy(TodoColumn.frog, Q.desc),
      Q.sortBy(TodoColumn.order, Q.asc)
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
    return this.undeletedTodos.extend(
      Q.where(TodoColumn.delegateAccepted, Q.notEq(false)),
      Q.where(TodoColumn.monthAndYear, title.substr(0, 7)),
      dateQuery,
      Q.sortBy(TodoColumn.order, Q.asc)
    )
  }

  todosBeforeDate = (title: string) => {
    const todayWithTimezoneOffset = new Date(title)
    const realmResultsWithoutDelegation = this.undeletedUncompleted.extend(
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
    // Today date changed
    observableNowEventEmitter.on(
      ObservableNowEventEmitterEvent.ObservableNowChanged,
      async () => {
        this.subscribeOldTodos()
        this.todayUncompletedTodos = this.getTodos(
          observableNow.todayTitle,
          false
        )
        this.todayCompletedTodos = this.getTodos(observableNow.todayTitle, true)
        this.todayUncompletedTodos
          .extend(Q.where(TodoColumn.frog, true))
          .observeCount(false)
          .subscribe((count) => (this.incompleteFrogsExist = count))
        this.currentSubscription = this.todayUncompletedTodos
          .observeCount(false)
          .subscribe((amount) => (this.uncompletedTodayAmount = amount))
        this.uncompletedTodayAmount =
          await this.todayUncompletedTodos.fetchCount()
        this.completedTodayAmount = await this.todayCompletedTodos.fetchCount()
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
    this.refreshTodos()
  }

  logout = () => {
    this.updatedAt = undefined
    this.refreshTodos()
    this.currentSubscription?.unsubscribe()
    this.oldTodosSubscribtion?.unsubscribe()
    this.uncompletedTodayAmount = 0
    this.completedTodayAmount = 0
  }

  refreshTodos = () => {
    refreshWidgetAndBadgeAndWatch()
  }

  async recalculateExactDates() {
    const todos = await todosCollection.query().fetch()
    const toUpdate = [] as MelonTodo[]

    for (const todo of todos) {
      toUpdate.push(
        todo.prepareUpdateWithDescription(
          (todoToUpdate) =>
            (todoToUpdate._exactDate = new Date(getTitle(todo))),
          'setting up new exact date'
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
