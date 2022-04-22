import { MelonTodo, MelonUser } from '@models/MelonTodo'
import {
  getDateString,
  getDateStringFromTodo,
  getTodayWithStartOfDay,
} from '@utils/time'

export function isTodoToday(todo: MelonTodo) {
  return getDateString(getTodayWithStartOfDay()) === getDateStringFromTodo(todo)
}

export function compareDelegates(
  delegateA?: MelonUser | null,
  delegateB?: MelonUser | null
) {
  return !!(
    delegateA?._id === delegateB?._id &&
    delegateA?.name === delegateB?.name &&
    delegateA?.isDelegator === delegateB?.isDelegator &&
    delegateA?.deleted === delegateB?.deleted &&
    delegateA?.createdAt === delegateB?.createdAt &&
    delegateA?.updatedAt === delegateB?.updatedAt &&
    delegateA?.delegateInviteToken === delegateB?.delegateInviteToken
  )
}

export function compareTodosProps(todoA?: MelonTodo, todoB?: MelonTodo) {
  return !!(
    todoA?._tempSyncId === todoB?._tempSyncId &&
    todoA?._exactDate === todoB?._exactDate &&
    todoA?._id === todoB?._id &&
    todoA?.createdAt === todoB?.createdAt &&
    todoA?.updatedAt === todoB?.updatedAt &&
    todoA?.text === todoB?.text &&
    todoA?.completed === todoB?.completed &&
    todoA?.frog === todoB?.frog &&
    todoA?.frogFails === todoB?.frogFails &&
    todoA?.skipped === todoB?.skipped &&
    todoA?.order === todoB?.order &&
    todoA?.monthAndYear === todoB?.monthAndYear &&
    todoA?.deleted === todoB?.deleted &&
    todoA?.encrypted === todoB?.encrypted &&
    todoA?.date === todoB?.date &&
    todoA?.time === todoB?.time &&
    todoA?.delegateAccepted === todoB?.delegateAccepted &&
    todoA?.repetitive === todoB?.repetitive &&
    compareDelegates(todoA?.user, todoB?.user) &&
    compareDelegates(todoA?.delegator, todoB?.delegator)
  )
}

export function compareTodos(completed: boolean) {
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
      } else if (a.date && !b.date && a.monthAndYear === b.monthAndYear) {
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
