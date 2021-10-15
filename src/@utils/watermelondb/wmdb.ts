import { MelonTag } from '@models/MelonTag'
import { MelonTodo, MelonUser } from '@models/MelonTodo'
import { Database } from '@nozbe/watermelondb'
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite'
import { wmdbMigrations } from './migration'
import { wmdbSchema } from './schema'
import { Tables } from './tables'

const adapter = new SQLiteAdapter({
  schema: wmdbSchema,
  migrations: wmdbMigrations,
  jsi: true,
})

export const database = new Database({
  adapter,
  modelClasses: [MelonTodo, MelonUser, MelonTag],
})

export const todosCollection = database.collections.get<MelonTodo>(Tables.todos)
export const tagsCollection = database.collections.get<MelonTag>(Tables.tags)
export const usersCollection = database.collections.get<MelonUser>(Tables.users)
