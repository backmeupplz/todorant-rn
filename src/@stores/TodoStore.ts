import { hydrate } from '@stores/hydration/hydrate'
import { hydrateStore } from '@stores/hydration/hydrateStore'
import { mobxRealmObject } from '@utils/mobx-realm/object'
import {
  observableNowEventEmitter,
  ObservableNowEventEmitterEvent,
} from '@utils/ObservableNow'
import { observableNow } from '@utils/ObservableNow'
import { getTitle, Todo } from '@models/Todo'
import { shallowMobxRealmCollection } from '@utils/mobx-realm/collection'
import { realm } from '@utils/realm'
import { refreshWidgetAndBadge } from '@utils/refreshWidgetAndBadge'
import { computed, makeObservable, observable } from 'mobx'
import { persist } from 'mobx-persist'

class TodoStore {
  hydrated = false

  @persist('date') @observable updatedAt?: Date

  getRealmTodos(title: string, completed: boolean) {
    return realm
      .objects(Todo)
      .filtered('delegateName = null')
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
      .sorted([
        ['frog', true],
        ['order', false],
      ])
  }

  todosForDate = (title: string) => {
    return realm
      .objects(Todo)
      .filtered('delegateName = null')
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
    return realm
      .objects(Todo)
      .filtered('delegateName = null')
      .filtered(
        `deleted = false && completed = false && _exactDate < ${todayString} && delegateAccepted != false`
      )
  }

  @computed get currentTodo() {
    return this.shallowTodayUncompletedTodos.length
      ? mobxRealmObject(this.shallowTodayUncompletedTodos[0])
      : undefined
  }

  @computed get unacceptedTodos() {
    return realm
      .objects(Todo)
      .filtered('delegateName = null')
      .filtered('deleted = false')
      .filtered('delegateAccepted = false')
  }

  @computed get delegatedTodos() {
    return realm.objects(Todo).filtered('delegateName != null')
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
    return !!this.oldTodos.length
  }

  constructor() {
    makeObservable(this)
    this.refreshTodos()
    // Today date changed
    observableNowEventEmitter.on(
      ObservableNowEventEmitterEvent.ObservableNowChanged,
      () => {
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
    refreshWidgetAndBadge()
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
