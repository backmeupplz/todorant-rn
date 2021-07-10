import { Model } from '@nozbe/watermelondb'
import {
  action,
  date,
  field,
  readonly,
  relation,
  writer,
} from '@nozbe/watermelondb/decorators'
import { Tables, TodoColumn } from '@utils/melondb'

export class MelonUser extends Model {
  static table = 'users'
  static associations = {
    todos: { type: 'belongs_to', key: 'todo_id' },
  }

  @field('server_id') _id?: string
  @field('name') name?: string
  @field('is_delegator') isDelegator?: boolean
  @field('is_deleted') deleted?: boolean
  @date('created_at') createdAt!: Date
  @date('updated_at') updatedAt!: Date
  @field('delegate_invite_token') delegateInviteToken?: string
}

export class MelonTodo extends Model {
  static table = Tables.todos

  static associations = {
    users: { type: 'has_many', foreignKey: 'todo_id' },
  }

  @field(TodoColumn._tempSyncId) _tempSyncId!: string
  @date(TodoColumn._exactDate) _exactDate?: Date
  @field(TodoColumn._id) _id?: string
  @date(TodoColumn.createdAt) createdAt!: Date
  @date(TodoColumn.updatedAt) updatedAt!: Date
  @field(TodoColumn.text) text!: string
  @field(TodoColumn.completed) completed!: boolean
  @field(TodoColumn.frog) frog!: boolean
  @field(TodoColumn.frogFails) frogFails!: number
  @field(TodoColumn.skipped) skipped!: boolean
  @field(TodoColumn.order) order!: number
  @field(TodoColumn.monthAndYear) monthAndYear?: string
  @field(TodoColumn.deleted) deleted!: boolean
  @field(TodoColumn.encrypted) encrypted!: boolean
  @field(TodoColumn.date) date?: string
  @field(TodoColumn.time) time?: string
  @field(TodoColumn.delegateAccepted) delegateAccepted?: boolean
  @relation('users', 'user_id') user?: MelonUser
  @relation('users', 'delegator_id') delegator?: MelonUser
  //user
  //delegator

  @writer async complete() {
    await this.update((todo) => (todo.completed = true))
  }

  @writer async delete() {
    await this.update((todo) => (todo.deleted = true))
  }

  @writer async uncomplete() {
    await this.update((todo) => (todo.completed = false))
  }

  @writer async accept() {
    await this.update((todo) => (todo.delegateAccepted = true))
  }
}
