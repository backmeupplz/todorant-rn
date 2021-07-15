import { tagsCollection, todosCollection } from './wmdb'

export async function gatherData() {
  const todos = todosCollection.query().fetch()
  const tags = tagsCollection.query().fetch()
  return { todos, tags }
}
