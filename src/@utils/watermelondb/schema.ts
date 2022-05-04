import {
  Tables,
  TagColumn,
  TodoColumn,
  UserColumn,
} from '@utils/watermelondb/tables'
import { appSchema, tableSchema } from '@nozbe/watermelondb'

export const wmdbSchema = appSchema({
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
        { name: TodoColumn.repetitive, type: 'boolean', isIndexed: true },
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
