import { Model } from '@nozbe/watermelondb'
import { date, field, relation, writer } from '@nozbe/watermelondb/decorators'
import { associations } from '@nozbe/watermelondb/Model'
import { Tables, TodoColumn, UserColumn } from '@utils/melondb'

export class MelonUser extends Model {
  static table = Tables.users
  static associations = associations([
    Tables.todos,
    { type: 'belongs_to', key: UserColumn._id },
  ])

  // Set is not properly typed in WMDB model yet, so we need to use this hack
  set!: (user: MelonUser) => void

  @writer async delete() {
    return await this.update((user) => (user.deleted = true))
  }

  @writer async updateUser(updatedUser: MelonUser) {
    return await this.update((user) => Object.assign(user, updatedUser))
  }

  @field(UserColumn._id) _id?: string
  @field(UserColumn.name) name?: string
  @field(UserColumn.isDelegator) isDelegator?: boolean
  @field(UserColumn.deleted) deleted?: boolean
  @date(UserColumn.createdAt) createdAt!: Date
  @date(UserColumn.updatedAt) updatedAt!: Date
  @field(UserColumn.delegateInviteToken) delegateInviteToken?: string
}

export class MelonTodo extends Model {
  static table = Tables.todos

  static associations = associations([
    Tables.users,
    { type: 'has_many', foreignKey: UserColumn._id },
  ])

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
  @relation(Tables.users, TodoColumn.user) user?: MelonUser
  @relation(Tables.users, TodoColumn.delegator) delegator?: MelonUser

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
