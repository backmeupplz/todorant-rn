import { MobxRealmModel } from '@utils/mobx-realm/model'
import {
  getDateString,
  getDateStringFromTodo,
  getTodayWithStartOfDay,
} from '@utils/time'
import { DelegationUser } from './DelegationUser'
import { MelonTodo, MelonUser } from './MelonTodo'
import { User } from './User'

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
      repetitive: { type: 'bool', indexed: true, default: false },

      user: 'DelegationUser?',
      delegator: 'DelegationUser?',
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
  repetitive!: boolean

  user?: DelegationUser
  delegator?: DelegationUser
  delegateAccepted?: boolean

  // Local values
  _tempSyncId?: string
  _exactDate!: Date
}

export function isTodoToday(todo: MelonTodo) {
  return getDateString(getTodayWithStartOfDay()) === getDateStringFromTodo(todo)
}

export function compareTodos(completed: Boolean) {
  return (a: MelonTodo, b: MelonTodo) => {
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

export async function cloneTodo(todo: MelonTodo) {
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
    repetitive: todo.repetitive,

    user: await cloneDelegator(todo.user),
    delegator: await cloneDelegator(todo.delegator),
    delegateAccepted: todo.delegateAccepted,
  }
}

export const cloneDelegator = async (user: MelonUser | undefined) => {
  user = user ? await user : undefined
  return user ? { _id: user._id, name: user.name } : undefined
}
