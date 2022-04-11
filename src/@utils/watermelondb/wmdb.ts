import { Database } from '@nozbe/watermelondb'
import { MelonTag } from '@models/MelonTag'
import { MelonTodo, MelonUser } from '@models/MelonTodo'
import { Tables } from '@utils/watermelondb/tables'
import { wmdbMigrations } from '@utils/watermelondb/migration'
import { wmdbSchema } from '@utils/watermelondb/schema'
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite'

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
