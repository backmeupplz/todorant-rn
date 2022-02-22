import { Model } from '@nozbe/watermelondb'
import { date, field, relation, writer } from '@nozbe/watermelondb/decorators'
import { associations } from '@nozbe/watermelondb/Model'
import { desc } from '@nozbe/watermelondb/QueryDescription'
import { Tables, TodoColumn, UserColumn } from '@utils/watermelondb/tables'

export class MelonUser extends Model {
  static table = Tables.users
  static associations = associations([
    Tables.todos,
    { type: 'belongs_to', key: UserColumn._id },
  ])

  prepareDestroyPermanentlyWithDescription(description: string) {
    try {
      return this.prepareDestroyPermanently()
    } catch (err) {
      throw Error(`${err} ${description}`)
    }
  }

  async updateWithDescription(
    writer: ArgumentExctractor<typeof this.update>,
    description: string
  ) {
    try {
      const updated = await this.update(writer)
      return updated
    } catch (err) {
      throw Error(`${err} ${description}`)
    }
  }

  prepareUpdateWithDescription(
    writer: ArgumentExctractor<typeof this.prepareUpdate>,
    description: string
  ) {
    try {
      return this.prepareUpdate(writer)
    } catch (err) {
      throw Error(`${err} ${description}`)
    }
  }

  // The set function is not properly typed in WMDB model yet, so we need to use this hack
  set!: (user: MelonUser | null) => void

  @writer async delete(description: string) {
    return await this.updateWithDescription(
      (user) => (user.deleted = true),
      description
    )
  }

  @writer async updateUser(updatedUser: MelonUser, description: string) {
    return await this.updateWithDescription(
      (user) => Object.assign(user, updatedUser),
      description
    )
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
  @field(TodoColumn.repetitive) repetitive!: boolean
  @relation(Tables.users, TodoColumn.user) user?: MelonUser
  @relation(Tables.users, TodoColumn.delegator) delegator?: MelonUser

  async updateWithDescription(
    writer: ArgumentExctractor<typeof this.update>,
    description: string
  ) {
    try {
      const updated = await this.update(writer)
      return updated
    } catch (err) {
      throw Error(`${err} ${description}`)
    }
  }

  prepareUpdateWithDescription(
    writer: ArgumentExctractor<typeof this.prepareUpdate>,
    description: string
  ) {
    try {
      return this.prepareUpdate(writer)
    } catch (err) {
      throw Error(`${err} ${description}`)
    }
  }

  @writer async complete(description: string) {
    await this.updateWithDescription(
      (todo) => (todo.completed = true),
      description
    )
  }

  @writer async delete(description: string) {
    await this.updateWithDescription(
      (todo) => (todo.deleted = true),
      description
    )
  }

  @writer async uncomplete(description: string) {
    await this.updateWithDescription(
      (todo) => (todo.completed = false),
      description
    )
  }

  @writer async accept(description: string) {
    await this.updateWithDescription(
      (todo) => (todo.delegateAccepted = true),
      description
    )
  }

  @writer async setServerId(serverId: string, description: string) {
    await this.updateWithDescription(
      (todo) => (todo._id = serverId),
      description
    )
  }
}

export type ArgumentExctractor<F extends Function> = F extends (
  args: infer A
) => any
  ? A
  : never
