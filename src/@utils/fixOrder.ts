import { sockets } from '@utils/sockets'
import { sharedTodoStore } from '@stores/TodoStore'
import { Todo, getTitle } from '@models/Todo'

export async function fixOrder(
  titlesInvolved: string[],
  addTodosOnTop = [] as Todo[],
  addTodosToBottom = [] as Todo[],
  sync = true
) {
  // Todo: implement
  // const addTodosOnTopIds = addTodosOnTop
  //   .map(t => t._id || t._tempSyncId)
  //   .filter(v => !!v) as string[]
  // const addTodosToBottomIds = addTodosToBottom
  //   .map(t => t._id || t._tempSyncId)
  //   .filter(v => !!v) as string[]
  // const todosToSave = [] as Todo[]
  // for (const titleInvolved of titlesInvolved) {
  //   const todos = sharedTodoStore.todosMap.get(titleInvolved) || []
  //   // Go over completed
  //   const orderedCompleted = todos
  //     .filter(t => t.completed)
  //     .sort(sortTodos(addTodosOnTopIds, addTodosToBottomIds))
  //   orderedCompleted.forEach((todo, i) => {
  //     if (todo.order !== i) {
  //       todo.order = i
  //       todosToSave.push(todo)
  //     }
  //   })
  //   // Go over uncompleted
  //   const orderedUncompleted = todos
  //     .filter(t => !t.completed)
  //     .sort(sortTodos(addTodosOnTopIds, addTodosToBottomIds))
  //   orderedUncompleted.forEach((todo, i) => {
  //     if (todo.order !== i) {
  //       todo.order = i
  //       todosToSave.push(todo)
  //     }
  //   })
  // }
  // // Save todos
  // todosToSave.forEach(todo => {
  //   todo.updatedAt = new Date()
  // })
  // // Sync
  // if (sync) {
  //   sockets.todoSyncManager.sync()
  // }
  sharedTodoStore.refreshTodos()
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
