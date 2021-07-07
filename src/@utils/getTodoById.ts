import { Todo } from '@models/Todo'
import { Q } from '@nozbe/watermelondb'
import { realm } from '@utils/realm'
import { todosCollection } from './wmdb'

export async function getTodoById(id?: string) {
  if (!id) {
    return undefined
  }
  const todos = await todosCollection
    .query(Q.or(Q.where('server_id', id), Q.where('id', id)))
    .fetch()
  return todos.length ? todos[0] : undefined
}
