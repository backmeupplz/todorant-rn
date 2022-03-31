import { tagsCollection, todosCollection } from 'src/@utils/watermelondb/wmdb'

export async function gatherData() {
  const todos = await todosCollection.query().fetch()
  const tags = await tagsCollection.query().fetch()
  return { todos, tags }
}
