import { getDateString, getDateStringFromTodo } from '@utils/time'
import { persist } from 'mobx-persist'
import { observable } from 'mobx'

export class Todo {
  @persist @observable _id?: string
  @persist('date' as any) @observable createdAt = new Date()
  @persist('date' as any) @observable updatedAt = new Date()
  @persist @observable text: string
  @persist @observable completed: boolean
  @persist @observable frog: boolean
  @persist @observable frogFails: number
  @persist @observable skipped: boolean
  @persist @observable order: number
  @persist @observable monthAndYear: string
  @persist @observable deleted: boolean
  @persist @observable date?: string
  @persist @observable time?: string

  // Temp value
  @persist _tempSyncId?: string

  constructor(
    text: string,
    completed: boolean,
    frog: boolean,
    frogFails: number,
    skipped: boolean,
    order: number,
    monthAndYear: string,
    deleted: boolean,
    date?: string,
    time?: string
  ) {
    this.text = text
    this.completed = completed
    this.frog = frog
    this.frogFails = frogFails
    this.skipped = skipped
    this.order = order
    this.monthAndYear = monthAndYear
    this.deleted = deleted
    this.date = date
    this.time = time
  }
}

export function isTodoToday(todo: Todo) {
  return getDateString(new Date()) === getDateStringFromTodo(todo)
}

export function compareTodos(completed: Boolean) {
  return (a: Todo, b: Todo) => {
    if (a.date === b.date && a.monthAndYear === b.monthAndYear) {
      if (a.frog && b.frog) {
        return a.order < b.order ? -1 : 1
      }
      if (a.frog) {
        return -1
      }
      if (b.frog) {
        return 1
      }
      return a.order < b.order ? -1 : 1
    } else {
      if (!a.date && b.date && a.monthAndYear === b.monthAndYear) {
        return -1
      } else if (!a.date && b.date && a.monthAndYear === b.monthAndYear) {
        return 1
      } else if (!a.date || !b.date) {
        if (a.monthAndYear < b.monthAndYear) {
          return completed ? 1 : -1
        } else {
          return completed ? -1 : 1
        }
      } else {
        if (`${a.monthAndYear}-${a.date}` < `${b.monthAndYear}-${b.date}`) {
          return completed ? 1 : -1
        } else {
          return completed ? -1 : 1
        }
      }
    }
  }
}

export function getTitle(todo: { monthAndYear: string; date?: string }) {
  return `${todo.monthAndYear}${todo.date ? `-${todo.date}` : ''}`
}
