import { Database, Q } from '@nozbe/watermelondb'
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite'
import {
  Tables,
  TodoColumn,
  watermelon,
  watertmelonMigration,
} from '@utils/melondb'
import { MelonTodo, MelonUser } from '@models/MelonTodo'
import { MelonTag } from '@models/MelonTag'

const adapter = new SQLiteAdapter({
  schema: watermelon,
  migrations: watertmelonMigration,
  jsi: true,
})

export const database = new Database({
  adapter,
  modelClasses: [MelonTodo, MelonUser, MelonTag],
})

export const todosCollection = database.collections.get<MelonTodo>(Tables.todos)
export const tagsCollection = database.collections.get<MelonTag>(Tables.tags)
export const usersCollection = database.collections.get<MelonUser>(Tables.users)
export const notDeletedTodos = todosCollection.query(
  Q.where(TodoColumn.deleted, false)
)
