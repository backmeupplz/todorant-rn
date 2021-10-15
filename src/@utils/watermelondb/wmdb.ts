import { MelonTag } from '@models/MelonTag'
import { MelonTodo, MelonUser } from '@models/MelonTodo'
import { Database, Model } from '@nozbe/watermelondb'
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite'
import { wmdbMigrations } from './migration'
import { wmdbSchema } from './schema'
import { Tables } from './tables'

const adapter = new SQLiteAdapter({
  schema: wmdbSchema,
  migrations: wmdbMigrations,
  jsi: true,
})

const database = new Database({
  adapter,
  modelClasses: [MelonTodo, MelonUser, MelonTag],
})

export async function wmdbUpdate<T extends Model>(
  toUpdate: T,
  updater: (updated: T) => void
) {
  return await wmdbWriter(async () => {
    await toUpdate.update(updater)
  })
}

export async function wmdbBatch(...args: Model[]) {
  return await wmdbWriter(async () => {
    await database.batch(...args)
  })
}

export async function wmdbWriter<T extends Model>(
  writer: () => Promise<void | T>
) {
  return await database.write(async () => {
    await writer()
  })
}

export async function dropDatabase() {
  return await wmdbWriter(async () => await database.unsafeResetDatabase())
}

// export async function wmdbWrite<T extends Model>(
//   updater?: (updated: T) => any,
//   update: boolean,
//   ...args: T[]
// ) {
//   if (args.length === 0) {
//     console.error('An empty args was passed to wmdb writer!')
//     return
//   }
//   database.write(async () => {
//     if (args.length === 1) {
//       if (update) {
//         await args[0].update((model) => {
//           Object.assign(model, args[0])
//         })
//       }
//     }
//   })
// }

export const todosCollection = database.collections.get<MelonTodo>(Tables.todos)
export const tagsCollection = database.collections.get<MelonTag>(Tables.tags)
export const usersCollection = database.collections.get<MelonUser>(Tables.users)
