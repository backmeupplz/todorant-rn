import { Model } from '@nozbe/watermelondb'
import {
  action,
  date,
  field,
  readonly,
  relation,
  writer,
} from '@nozbe/watermelondb/decorators'

export class MelonUser extends Model {
  static table = 'users'
  static associations = {
    todos: { type: 'belongs_to', key: 'todo_id' },
  }

  @field('server_id') _id?: string
  @field('name') name?: string
  @field('is_delegator') isDelegator?: boolean
  @field('is_deleted') deleted?: boolean
  @readonly @date('created_at') createdAt!: Date
  @readonly @date('updated_at') updatedAt!: Date
  @field('delegate_invite_token') delegateInviteToken?: string
}

export class MelonTodo extends Model {
  static table = 'todos'
  static associations = {
    users: { type: 'has_many', foreignKey: 'todo_id' },
  }

  @field('text') text!: string
  @field('month_and_year') monthAndYear: string | undefined
  @field('time') time: string | undefined
  @field('is_frog') frog!: boolean
  @date('exact_date_at') _exactDate: Date | undefined
  @field('is_completed') completed!: boolean
  @field('frog_fails') frogFails!: number
  @field('is_skipped') skipped!: boolean
  @field('order') order!: number
  @field('is_deleted') deleted!: boolean
  @field('is_encrypted') encrypted!: boolean
  @field('date') date: string | undefined
  @field('is_delegate_accepted') delegateAccepted?: boolean
  @readonly @field('id') _tempSyncId!: string
  @field('server_id') _id?: string
  @relation('users', 'user_id') user
  @relation('users', 'user_id') delegator
  //user
  //delegator
  @readonly @date('created_at') createdAt!: Date
  @readonly @date('updated_at') updatedAt!: Date

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
