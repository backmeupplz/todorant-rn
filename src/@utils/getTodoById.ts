import { Todo } from '@models/Todo'
import { realm } from '@utils/realm'

export function getTodoById(id?: string) {
  if (!id) {
    return undefined
  }
  const todos = realm
    .objects(Todo)
    .filtered(`_id = "${id}" || _tempSyncId = "${id}"`)
  return todos.length ? todos[0] : undefined
}
