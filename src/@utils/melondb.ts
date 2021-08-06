import { MelonTag } from '@models/MelonTag'
import { MelonTodo, MelonUser } from '@models/MelonTodo'
import { tableName, appSchema, tableSchema } from '@nozbe/watermelondb'
import { schemaMigrations } from '@nozbe/watermelondb/Schema/migrations'

export const Tables = {
  tags: tableName<MelonTodo>('tags'),
  todos: tableName<MelonTag>('todos'),
  users: tableName<MelonUser>('users'),
}

export enum TodoColumn {
  _tempSyncId = 'id',
  _exactDate = 'exact_date_at',
  _id = 'server_id',
  createdAt = 'created_at',
  updatedAt = 'updated_at',
  text = 'text',
  completed = 'is_completed',
  frog = 'is_frog',
  frogFails = 'frog_fails',
  skipped = 'is_skipped',
  order = 'order',
  monthAndYear = 'month_and_year',
  deleted = 'is_deleted',
  encrypted = 'is_encrypted',
  date = 'date',
  time = 'time',

  user = 'user_id',
  delegator = 'delegator_id',
  delegateAccepted = 'is_delegate_accepted',
}
export enum TagColumn {
  _tempSyncId = 'id',
  _id = 'server_id',
  createdAt = 'created_at',
  updatedAt = 'updated_at',
  deleted = 'is_deleted',
  tag = 'tag',
  color = 'color',
  numberOfUses = 'number_of_uses',
  epic = 'is_epic',
  epicGoal = 'epic_goal',
  epicCompleted = 'is_epic_completed',
  epicPoints = 'epic_points',
  epicOrder = 'epic_order',
}
export enum UserColumn {
  _id = 'server_id',
  createdAt = 'created_at',
  updatedAt = 'updated_at',
  name = 'name',
  isDelegator = 'is_delegator',
  deleted = 'is_deleted',
  delegateInviteToken = 'delegate_invite_token',
  todoId = 'todo_id',
}

export const watermelon = appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: Tables.todos,
      columns: [
        {
          name: TodoColumn._exactDate,
          type: 'number',
          isOptional: true,
          isIndexed: true,
        },
        {
          name: TodoColumn._id,
          type: 'string',
          isOptional: true,
          isIndexed: true,
        },
        { name: TodoColumn.createdAt, type: 'number', isIndexed: true },
        { name: TodoColumn.updatedAt, type: 'number', isIndexed: true },
        { name: TodoColumn.text, type: 'string' },
        { name: TodoColumn.completed, type: 'boolean', isIndexed: true },
        { name: TodoColumn.frog, type: 'boolean' },
        { name: TodoColumn.frogFails, type: 'number' },
        { name: TodoColumn.skipped, type: 'boolean', isIndexed: true },
        { name: TodoColumn.order, type: 'number' },
        {
          name: TodoColumn.monthAndYear,
          type: 'string',
          isOptional: true,
          isIndexed: true,
        },
        { name: TodoColumn.deleted, type: 'boolean', isIndexed: true },
        { name: TodoColumn.encrypted, type: 'boolean', isIndexed: true },
        {
          name: TodoColumn.date,
          type: 'string',
          isOptional: true,
          isIndexed: true,
        },
        { name: TodoColumn.time, type: 'string', isOptional: true },
        {
          name: TodoColumn.delegateAccepted,
          type: 'boolean',
          isOptional: true,
          isIndexed: true,
        },
        {
          name: TodoColumn.user,
          type: 'string',
          isOptional: true,
          isIndexed: true,
        },
        {
          name: TodoColumn.delegator,
          type: 'string',
          isOptional: true,
          isIndexed: true,
        },
      ],
    }),
    tableSchema({
      name: Tables.users,
      columns: [
        { name: UserColumn._id, type: 'string', isOptional: true },
        { name: UserColumn.createdAt, type: 'number' },
        { name: UserColumn.updatedAt, type: 'number' },
        { name: UserColumn.name, type: 'string', isOptional: true },
        { name: UserColumn.isDelegator, type: 'boolean', isOptional: true },
        { name: UserColumn.deleted, type: 'boolean', isOptional: true },
        {
          name: UserColumn.delegateInviteToken,
          type: 'string',
          isOptional: true,
        },
        { name: UserColumn.todoId, type: 'string', isOptional: true },
      ],
    }),
    tableSchema({
      name: Tables.tags,
      columns: [
        {
          name: TagColumn._id,
          type: 'string',
          isOptional: true,
          isIndexed: true,
        },
        { name: TagColumn.createdAt, type: 'number', isIndexed: true },
        { name: TagColumn.updatedAt, type: 'number', isIndexed: true },
        { name: TagColumn.deleted, type: 'boolean', isIndexed: true },
        { name: TagColumn.tag, type: 'string' },
        { name: TagColumn.color, type: 'string', isOptional: true },
        { name: TagColumn.numberOfUses, type: 'number', isIndexed: true },
        { name: TagColumn.epic, type: 'boolean', isOptional: true },
        { name: TagColumn.epicGoal, type: 'number', isOptional: true },
        { name: TagColumn.epicCompleted, type: 'boolean', isOptional: true },
        { name: TagColumn.epicPoints, type: 'number', isOptional: true },
        { name: TagColumn.epicOrder, type: 'number', isOptional: true },
      ],
    }),
  ],
})

export const watertmelonMigration = schemaMigrations({
  migrations: [
    // We'll add migration definitions here later
  ],
})