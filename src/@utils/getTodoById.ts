import { Todo } from '@models/Todo'
import { Q } from '@nozbe/watermelondb'
import { realm } from '@utils/realm'
import { TodoColumn } from './melondb'
import { todosCollection } from './wmdb'

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
