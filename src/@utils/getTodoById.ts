import { Q } from '@nozbe/watermelondb'
import { TodoColumn } from '@utils/watermelondb/tables'
import { todosCollection } from '@utils/watermelondb/wmdb'

export async function getTodoById(id?: string) {
  if (!id) {
    return undefined
  }
  const todos = await todosCollection
    .query(
      Q.or(Q.where(TodoColumn._id, id), Q.where(TodoColumn._tempSyncId, id))
    )
    .fetch()
  return todos.length ? todos[0] : undefined
}
