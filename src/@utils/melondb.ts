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
        { name: 'is_skipped', type: 'boolean' },
        { name: 'order', type: 'number' },
        { name: 'is_deleted', type: 'boolean' },
        { name: 'is_encrypted', type: 'boolean' },
        { name: 'date', type: 'string', isOptional: true },
        { name: 'is_delegate_accepted', type: 'boolean', isOptional: true },
        { name: 'server_id', type: 'string', isOptional: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
        { name: 'user_id', type: 'string', isIndexed: true },
      ],
    }),
    tableSchema({
      name: 'users',
      columns: [
        { name: 'server_id', type: 'string', isOptional: true },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
        { name: 'name', type: 'string', isOptional: true },
        { name: 'is_delegator', type: 'boolean', isOptional: true },
        { name: 'is_deleted', type: 'boolean', isOptional: true },
        { name: 'delegate_invite_token', type: 'string', isOptional: true },
        { name: 'todo_id', type: 'string', isIndexed: true },
      ],
    }),
    tableSchema({
      name: 'tags',
      columns: [
        {
          name: 'server_id',
          type: 'string',
          isOptional: true,
          isIndexed: true,
        },
        { name: 'created_at', type: 'number', isIndexed: true },
        { name: 'updated_at', type: 'number', isIndexed: true },
        { name: 'is_deleted', type: 'boolean', isIndexed: true },
        { name: 'tag', type: 'string' },
        { name: 'color', type: 'string', isOptional: true },
        { name: 'number_of_uses', type: 'number', isIndexed: true },
        { name: 'is_epic', type: 'boolean', isOptional: true },
        { name: 'epic_goal', type: 'number', isOptional: true },
        { name: 'is_epic_completed', type: 'boolean', isOptional: true },
        { name: 'epic_points', type: 'number', isOptional: true },
        { name: 'epic_order', type: 'number', isOptional: true },
      ],
    }),
  ],
})

export const watertmelonMigration = schemaMigrations({
  migrations: [
    // We'll add migration definitions here later
  ],
})
