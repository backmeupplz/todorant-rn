import { DelegationUser, DelegationUserInTodo } from '@models/DelegationUser'
import { MelonTag } from '@models/MelonTag'
import { MelonTodo, MelonUser } from '@models/MelonTodo'
import { cloneTag, Tag } from '@models/Tag'
import { cloneTodo, Todo } from '@models/Todo'
import { sharedDelegationStore } from '@stores/DelegationStore'
import { sharedTagStore } from '@stores/TagStore'
import { sharedTodoStore } from '@stores/TodoStore'
import Realm from 'realm'
import { cloneDelegation } from './delegations'
import { realmTimestampFromDate } from './realmTimestampFromDate'
import {
  database,
  tagsCollection,
  todosCollection,
  usersCollection,
} from './wmdb'

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

  const createdTodos = await Promise.all(
    nonServerTodos.map(async (todo) => {
      const clonedTodo = await cloneTodo(todo as unknown as MelonTodo)
      delete clonedTodo.delegator
      delete clonedTodo.user
      delete (clonedTodo as any)._tempSyncId
      return todosCollection.prepareCreate((todoToCreate) => {
        Object.assign(todoToCreate, clonedTodo)
      })
    })
  )
  const createdTags = await Promise.all(
    nonServerTags.map(async (tag) => {
      const clonedTag = await cloneTag(tag as unknown as MelonTag)
      delete (clonedTag as any)._tempSyncId
      return tagsCollection.prepareCreate((tagToCreate) => {
        Object.assign(tagToCreate, clonedTag)
      })
    })
  )
  const createdDelegates = await Promise.all(
    nonServerDelegates.map(async (user) => {
      const clonedUser = cloneDelegation(user as unknown as MelonUser)
      clonedUser.isDelegator = false
      return usersCollection.prepareCreate((userToCreate) => {
        Object.assign(userToCreate, clonedUser)
      })
    })
  )
  const createdDelegators = await Promise.all(
    nonServerDelegators.map(async (user) => {
      const clonedUser = cloneDelegation(user as unknown as MelonUser)
      clonedUser.isDelegator = true
      return usersCollection.prepareCreate((userToCreate) => {
        Object.assign(userToCreate, clonedUser)
      })
    })
  )

  sharedDelegationStore.updatedAt = undefined

  await database.write(
    async () =>
      await database.batch(
        ...createdTodos,
        ...createdTags,
        ...createdDelegates,
        ...createdDelegators
      )
  )
}
