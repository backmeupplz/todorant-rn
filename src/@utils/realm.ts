import { DelegationUser, DelegationUserInTodo } from '@models/DelegationUser'
import { Tag } from '@models/Tag'
import { Todo } from '@models/Todo'
import { sharedDelegationStore } from '@stores/DelegationStore'
import { sharedTagStore } from '@stores/TagStore'
import { sharedTodoStore } from '@stores/TodoStore'
import Realm from 'realm'
import { realmTimestampFromDate } from './realmTimestampFromDate'
import { database, todosCollection, usersCollection } from './wmdb'

export const realm = new Realm({
  schema: [DelegationUser, Todo, Tag, DelegationUserInTodo],
  schemaVersion: 15,
  migration: (oldRealm, newRealm) => {
    if (oldRealm.schemaVersion < 13) {
      // DelegationUser
      newRealm.delete(newRealm.objects('DelegationUser'))
    }
  },
})

export async function migrateRealmToWMDB() {
  const lastTodoSync = sharedTodoStore.updatedAt
  const lastTagSync = sharedTagStore.updatedAt
  const lastDelegationSync = sharedDelegationStore.updatedAt

  const nonServerTodos = lastTodoSync
    ? realm.objects(Todo).filtered(`_id = null`)
    : realm.objects(Todo)
  const nonServerTags = lastTagSync
    ? realm.objects(Tag).filtered(`_id = null`)
    : realm.objects(Tag)
  // Get local delegators
  const delegators = realm
    .objects(DelegationUser)
    .filtered('isDelegator = true')
  // Get local delegates
  const delegates = realm
    .objects(DelegationUser)
    .filtered('isDelegator != true')
  // Filter delegators that changed locally
  const nonServerDelegators = lastDelegationSync
    ? delegators.filtered(`_id = null`)
    : delegators
  // Filter delegates that changed locally
  const nonServerDelegates = lastDelegationSync
    ? delegates.filtered(`_id = null`)
    : delegates

  const createdTodos = nonServerTodos.map((todo) => {
    return todosCollection.prepareCreate((todoToCreate) => {
      todoToCreate.text = todo.text
    })
  })
  await database.write(async () => await database.batch(...createdTodos))
}
