import { Tag } from '@models/Tag'
import { Todo } from '@models/Todo'
import { realm } from '@utils/realm'
import { tagsCollection, todosCollection } from './wmdb'

export async function gatherData() {
  const todos = todosCollection.query().fetch()
  const tags = tagsCollection.query().fetch()
  return { todos, tags }
}
