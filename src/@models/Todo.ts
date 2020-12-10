import { sharedSettingsStore } from '@stores/SettingsStore'
import { MobxRealmModel } from '@utils/mobx-realm/model'
import {
  getDateDateString,
  getDateMonthAndYearString,
  getDateString,
  getDateStringFromTodo,
} from '@utils/time'

export class Todo extends MobxRealmModel {
  public static schema = {
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
      monthAndYear: { type: 'string?', indexed: true },
      deleted: { type: 'bool', indexed: true },
      encrypted: { type: 'bool', indexed: true, default: false },
      date: { type: 'string?', indexed: true },
      time: 'string?',

      delegatorName: { type: 'string?', indexed: true },
      delegateAccepted: { type: 'bool?', indexed: true },
    },
  }

  objectSchema() {
    return Todo.schema
  }

  _id?: string
  createdAt = new Date()
  updatedAt = new Date()
  text!: string
  completed!: boolean
  frog!: boolean
  frogFails!: number
  skipped!: boolean
  order!: number
  monthAndYear?: string
  deleted!: boolean
  encrypted!: boolean
  date?: string
  time?: string

  delegatorName?: string
  delegateAccepted?: boolean

  // Local values
  _tempSyncId?: string
  _exactDate!: Date
}

export function isTodoToday(todo: Todo) {
  return getDateString(new Date()) === getDateStringFromTodo(todo)
}

export function isTodoOld(todo: Todo) {
  const now = new Date()
  const day = getDateDateString(now)
  const monthAndYear = getDateMonthAndYearString(now)

  const startTimeOfDay = sharedSettingsStore.startTimeOfDaySafe
  const yesterday = parseInt(day) - 1
  const todayDate = new Date()
  todayDate.setHours(parseInt(startTimeOfDay.substr(0, 2)))
  todayDate.setMinutes(parseInt(startTimeOfDay.substr(3)))

  // Exact date exists or not
  if (todo.date) {
    if (todo.monthAndYear && todo.monthAndYear < monthAndYear) {
      return true
    }
    if (
      todo.monthAndYear === monthAndYear &&
      parseInt(todo.date) == yesterday &&
      now >= todayDate
    ) {
      return true
    }
    if (todo.monthAndYear === monthAndYear && parseInt(todo.date) < yesterday) {
      return true
    }
  } else {
    if (todo.monthAndYear && todo.monthAndYear <= monthAndYear) {
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
        if (
          a.monthAndYear &&
          b.monthAndYear &&
          a.monthAndYear < b.monthAndYear
        ) {
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

export function getTitle(todo: { monthAndYear?: string; date?: string }) {
  return `${todo.monthAndYear ? todo.monthAndYear : ''}${
    todo.date ? `-${todo.date}` : ''
  }`
}

export function cloneTodo(todo: Todo) {
  return {
    _tempSyncId: todo._tempSyncId,
    _exactDate: todo._exactDate,

    _id: todo._id,
    createdAt: todo.createdAt,
    updatedAt: todo.updatedAt,
    text: todo.text,
    completed: todo.completed,
    frog: todo.frog,
    frogFails: todo.frogFails,
    skipped: todo.skipped,
    order: todo.order,
    monthAndYear: todo.monthAndYear,
    deleted: todo.deleted,
    encrypted: todo.encrypted,
    date: todo.date,
    time: todo.time,

    delegatorName: todo.delegatorName,
    delegateAccepted: todo.delegateAccepted,
  }
}
