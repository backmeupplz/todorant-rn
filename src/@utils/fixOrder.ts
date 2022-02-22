import { sharedSync } from '@sync/Sync'
import { sharedSettingsStore } from '@stores/SettingsStore'
import { sharedTodoStore } from '@stores/TodoStore'
import { SyncRequestEvent } from '@sync/SyncRequestEvent'
import { MelonTodo } from '@models/MelonTodo'
import { database } from './watermelondb/wmdb'
import { Q } from '@nozbe/watermelondb'
import { TodoColumn } from './watermelondb/tables'

export async function fixOrder(
  titlesInvolved: string[],
  addTodosOnTop = [] as MelonTodo[],
  addTodosToBottom = [] as MelonTodo[],
  timeTodosToYield = [] as MelonTodo[],
  sync = true
) {
  // Deduplicate
  const titlesInvolvedSet = new Set(titlesInvolved)
  // Get ids
  const addTodosOnTopIds = addTodosOnTop.map((t) => t._id || t._tempSyncId)
  const addTodosToBottomIds = addTodosToBottom.map(
    (t) => t._id || t._tempSyncId
  )
  const toUpdate: any[] = []
  // Fix every title
  for (const titleInvolved of titlesInvolvedSet) {
    const todos = sharedTodoStore.todosForDate(titleInvolved)
    const completedForDate = await todos
      .extend(Q.where(TodoColumn.completed, true))
      .fetch()
    // Go over completed
    const orderedCompleted = completedForDate.sort(
      sortTodos(addTodosOnTopIds, addTodosToBottomIds)
    )
    orderedCompleted.forEach((todo, i) => {
      if (todo.order !== i) {
        toUpdate.push(todo.prepareUpdate((todo) => (todo.order = i)))
      }
    })
    // Go over uncompleted
    const uncompletedForDate = await todos
      .extend(Q.where(TodoColumn.completed, false))
      .fetch()
    const orderedUncompleted = uncompletedForDate.sort(
      sortTodos(addTodosOnTopIds, addTodosToBottomIds)
    )
    // Fix exact times
    if (sharedSettingsStore.preserveOrderByTime) {
      while (!isTimeSorted(orderedUncompleted)) {
        fixOneTodoTime(orderedUncompleted, timeTodosToYield)
      }
    }
    // Save order
    orderedUncompleted.forEach((todo, i) => {
      if (todo.order !== i) {
        toUpdate.push(todo.prepareUpdate((todo) => (todo.order = i)))
      }
    })
  }

  await database.write(async () => await database.batch(...toUpdate))

  // Refresh
  sharedTodoStore.refreshTodos()
  // Sync
  if (sync) {
    sharedSync.sync(SyncRequestEvent.Todo)
  }
}

function isTimeSorted(todos: (MelonTodo & Partial<MelonTodo>)[]) {
  let result = true
  let time: number | undefined
  for (const todo of todos) {
    if (todo.time) {
      if (time !== undefined) {
        const todoTime = minutesFromTime(todo.time)
        if (todoTime < time) {
          return false
        } else {
          time = todoTime
        }
      } else {
        time = minutesFromTime(todo.time)
      }
    }
  }
  return result
}

function fixOneTodoTime(
  todos: (MelonTodo & Partial<MelonTodo>)[],
  timeTodosToYield: MelonTodo[]
) {
  const timeTodosToYieldIds = timeTodosToYield.map(
    (t) => t._id || t._tempSyncId
  )
  let time: number | undefined
  let prevTodoWithTimeIndex: number | undefined
  let i = 0
  for (const todo of todos) {
    if (todo.time) {
      if (time !== undefined && prevTodoWithTimeIndex != undefined) {
        const todoTime = minutesFromTime(todo.time)
        if (todoTime < time) {
          const prevTodo = todos[prevTodoWithTimeIndex]
          const curTodo = todo
          // Fix
          if (
            timeTodosToYieldIds.indexOf(curTodo._id || curTodo._tempSyncId) > -1
          ) {
            // Current should be moved
            todos.splice(i, 1)
            todos.splice(prevTodoWithTimeIndex, 0, curTodo)
          } else {
            // Prev todo should be moved
            todos.splice(prevTodoWithTimeIndex, 1)
            todos.splice(i, 0, prevTodo)
          }
          // Halt this function
          return
        } else {
          time = todoTime
          prevTodoWithTimeIndex = i
        }
      } else {
        time = minutesFromTime(todo.time)
        prevTodoWithTimeIndex = i
      }
    }
    i++
  }
}

function minutesFromTime(time: string) {
  const components = time.split(':').map((c) => parseInt(c, 10))
  return components[0] * 60 + components[1]
}

function sortTodos(todosOnTopIds: string[], todosOnBottomIds: string[]) {
  return (a: MelonTodo, b: MelonTodo) => {
    const aId = a._id || a._tempSyncId
    const bId = b._id || b._tempSyncId
    if (
      (includes(todosOnTopIds, aId) && includes(todosOnTopIds, bId)) ||
      (includes(todosOnBottomIds, aId) && includes(todosOnBottomIds, bId)) ||
      (!includes(todosOnTopIds, aId) &&
        !includes(todosOnTopIds, bId) &&
        !includes(todosOnBottomIds, aId) &&
        !includes(todosOnBottomIds, bId))
    ) {
      return a.order < b.order ? -1 : 1
    } else if (includes(todosOnTopIds, aId)) {
      return -1
    } else if (includes(todosOnTopIds, bId)) {
      return 1
    } else if (includes(todosOnBottomIds, aId)) {
      return 1
    } else if (includes(todosOnBottomIds, bId)) {
      return -1
    } else {
      return a.order < b.order ? -1 : 1
    }
  }
}

function includes(array: string[], element?: string) {
  if (!element) {
    return false
  }
  return array.indexOf(element) > -1
}
