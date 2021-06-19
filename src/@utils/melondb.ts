import { appSchema, tableSchema } from '@nozbe/watermelondb'
import { schemaMigrations } from '@nozbe/watermelondb/Schema/migrations'

export const watermelon = appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: 'todos',
      columns: [
        { name: 'text', type: 'string' },
        { name: 'month_and_year', type: 'string', isOptional: true },
        { name: 'time', type: 'string', isOptional: true },
        { name: 'is_frog', type: 'boolean' },
        { name: 'exact_date_at', type: 'number', isOptional: true },
        { name: 'is_completed', type: 'boolean' },
        { name: 'frog_fails', type: 'number' },
        { name: 'skipped', type: 'boolean' },
        { name: 'order', type: 'number' },
        { name: 'is_deleted', type: 'boolean' },
        { name: 'encrypted', type: 'boolean' },
        { name: 'date', type: 'string', isOptional: true },
      ],
    }),
  ],
})

export const watertmelonMigration = schemaMigrations({
  migrations: [
    // We'll add migration definitions here later
  ],
})
