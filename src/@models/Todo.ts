import {
  getDateString,
  getDateStringFromTodo,
  getTodayWithStartOfDay,
} from '@utils/time'
import { MelonTodo, MelonUser } from './MelonTodo'
import { User } from './User'

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
    id: todo.id,
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
  try {
    user = user ? await user : undefined
    return user ? { _id: user._id, name: user.name } : undefined
  } catch (err) {
    return undefined
  }
}
