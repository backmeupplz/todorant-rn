import { realm } from '@utils/realm'
import { sockets } from '@utils/sockets'
import { sharedTodoStore } from '@stores/TodoStore'
import { Todo, getTitle } from '@models/Todo'

export async function fixOrder(
  titlesInvolved: string[],
  addTodosOnTop = [] as Todo[],
  addTodosToBottom = [] as Todo[],
  sync = true
) {
  // Deduplicate
  const titlesInvolvedSet = new Set(titlesInvolved)
  // Get ids
  const addTodosOnTopIds = addTodosOnTop
    .map(t => t._id || t._tempSyncId)
    .filter(v => !!v) as string[]
  const addTodosToBottomIds = addTodosToBottom
    .map(t => t._id || t._tempSyncId)
    .filter(v => !!v) as string[]
  // Fix every title
  for (const titleInvolved of titlesInvolvedSet) {
    const todos = sharedTodoStore.todosForDate(new Date(titleInvolved))
    // Go over completed
    const orderedCompleted = Array.from(
      todos.filtered(`completed = true`)
    ).sort(sortTodos(addTodosOnTopIds, addTodosToBottomIds))
    realm.write(() => {
      orderedCompleted.forEach((todo, i) => {
        if (todo.order !== i) {
          todo.order = i
          todo.updatedAt = new Date()
        }
      })
    })
    // Go over uncompleted
    const orderedUncompleted = Array.from(
      todos.filtered(`completed = false`)
    ).sort(sortTodos(addTodosOnTopIds, addTodosToBottomIds))
    realm.write(() => {
      orderedUncompleted.forEach((todo, i) => {
        if (todo.order !== i) {
          todo.order = i
          todo.updatedAt = new Date()
        }
      })
    })
  }
  // Refresh
  sharedTodoStore.refreshTodos()
  // Sync
  if (sync) {
    sockets.todoSyncManager.sync()
  }
}

function sortTodos(todosOnTopIds: string[], todosOnBottomIds: string[]) {
  return (a: Todo, b: Todo) => {
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
