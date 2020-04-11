import {
  getDateString,
  getDateStringFromTodo,
  getDateDateString,
  getDateMonthAndYearString,
} from '@utils/time'
import { observable } from 'mobx'

export class Todo {
  static schema = {
    name: 'Todo',
    properties: {
      _tempSyncId: { type: 'string?', indexed: true },
      _exactDate: { type: 'date', indexed: true },

      _id: { type: 'string?', indexed: true },
      createdAt: { type: 'date', indexed: true },
      updatedAt: { type: 'date', indexed: true },
      text: 'string',
      completed: { type: 'bool', indexed: true },
      frog: 'bool',
      frogFails: 'int',
      skipped: { type: 'bool', indexed: true },
      order: 'int',
      monthAndYear: { type: 'string', indexed: true },
      deleted: { type: 'bool', indexed: true },
      date: { type: 'string?', indexed: true },
      time: 'string?',
    },
  }

  @observable _id?: string
  @observable createdAt = new Date()
  @observable updatedAt = new Date()
  @observable text!: string
  @observable completed!: boolean
  @observable frog!: boolean
  @observable frogFails!: number
  @observable skipped!: boolean
  @observable order!: number
  @observable monthAndYear!: string
  @observable deleted!: boolean
  @observable date?: string
  @observable time?: string

  // Local values
  @observable _tempSyncId?: string
  _exactDate!: Date

  isStrictlyEqual(todo: Todo) {
    return this._id === todo._id &&
      this.createdAt === todo.createdAt &&
      this.updatedAt === todo.updatedAt &&
      this.text === todo.text &&
      this.completed === todo.completed &&
      this.frog === todo.frog &&
      this.frogFails === todo.frogFails &&
      this.skipped === todo.skipped &&
      this.order === todo.order &&
      this.monthAndYear === todo.monthAndYear &&
      this.deleted === todo.deleted &&
      this.date === todo.date &&
      this.time === todo.time &&
      this._tempSyncId === todo._tempSyncId && this._exactDate === todo._exactDate
  }
}

export function isTodoToday(todo: Todo) {
  return getDateString(new Date()) === getDateStringFromTodo(todo)
}

export function isTodoOld(todo: Todo) {
  const day = getDateDateString(new Date())
  const monthAndYear = getDateMonthAndYearString(new Date())

  // Exact date exists or not
  if (todo.date) {
    if (todo.monthAndYear < monthAndYear) {
      return true
    }
    if (todo.monthAndYear === monthAndYear && todo.date < day) {
      return true
    }
  } else {
    if (todo.monthAndYear <= monthAndYear) {
      return true
    }
  }
  return false
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
