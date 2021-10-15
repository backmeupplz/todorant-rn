import { tagsCollection, todosCollection } from './watermelondb/wmdb'

export async function gatherData() {
  const todos = todosCollection.query().fetch()
  const tags = tagsCollection.query().fetch()
  return { todos, tags }
}
