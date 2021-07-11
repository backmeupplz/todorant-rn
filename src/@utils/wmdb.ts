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

// SQLiteAdapterOptions

// First, create the adapter to the underlying database:
const adapter = new SQLiteAdapter({
  schema: watermelon,
  // synchronous: true,
  // (You might want to comment it out for development purposes -- see Migrations documentation)
  migrations: watertmelonMigration,
  // (optional database name or file system path)
  // dbName: 'myapp',
  // (recommended option, should work flawlessly out of the box on iOS. On Android,
  // additional installation steps have to be taken - disable if you run into issues...)
  jsi: true /* Platform.OS === 'ios' */,
  // (optional, but you should implement this method)
})

// Then, make a Watermelon database from it!
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
