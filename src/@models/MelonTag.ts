import { Model } from '@nozbe/watermelondb'
import {
  action,
  date,
  field,
  readonly,
  relation,
  writer,
} from '@nozbe/watermelondb/decorators'
import { Tables, TagColumn } from '@utils/watermelondb/tables'
import { ArgumentExctractor } from './MelonTodo'

export class MelonTag extends Model {
  static table = Tables.tags

  @field(TagColumn._id) _id?: string
  @field(TagColumn._tempSyncId) _tempSyncId!: string
  @date(TagColumn.createdAt) createdAt!: Date
  @date(TagColumn.updatedAt) updatedAt!: Date
  @field(TagColumn.deleted) deleted?: boolean
  @field(TagColumn.tag) tag!: string
  @field(TagColumn.color) color?: string
  @field(TagColumn.numberOfUses) numberOfUses!: number
  @field(TagColumn.epic) epic?: boolean
  @field(TagColumn.epicGoal) epicGoal?: number
  @field(TagColumn.epicCompleted) epicCompleted?: boolean
  @field(TagColumn.epicPoints) epicPoints?: number
  @field(TagColumn.epicOrder) epicOrder?: number

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
  @writer async completeEpic(description: string) {
    await this.updateWithDescription((tag) => {
      tag.epic = false
      tag.epicPoints = 0
      tag.epicGoal = 0
      tag.epicCompleted = true
    }, description)
  }

  @writer async delete(description: string) {
    await this.updateWithDescription((tag) => (tag.deleted = true), description)
  }

  @writer async turnTagToEpic(goal: number, description: string) {
    await this.updateWithDescription((tag) => {
      tag.epic = true
      tag.epicGoal = goal
      tag.epicPoints = 0
    }, description)
  }

  @writer async changeColor(color: string, description: string) {
    await this.updateWithDescription((tag) => (tag.color = color), description)
  }

  @writer async changeText(text: string, description: string) {
    await this.updateWithDescription((tag) => (tag.tag = text), description)
  }

  @writer async setServerId(serverId: string, description: string) {
    await this.updateWithDescription((tag) => (tag._id = serverId), description)
  }

  @writer async unEpic(description: string) {
    await this.updateWithDescription((tag) => {
      tag.epicCompleted = false
      tag.epicGoal = 0
      tag.epicOrder = 0
      tag.epicPoints = 0
      tag.epic = false
    }, description)
  }
}

export function cloneTag(tag: MelonTag) {
  return {
    _tempSyncId: tag._tempSyncId,
    _id: tag._id,
    id: tag.id,
    createdAt: tag.createdAt,
    updatedAt: tag.updatedAt,
    deleted: tag.deleted,

    tag: tag.tag,
    color: tag.color,
    numberOfUses: tag.numberOfUses,

    epic: tag.epic,
    epicGoal: tag.epicGoal,
    epicCompleted: tag.epicCompleted,
    epicPoints: tag.epicPoints,
    epicOrder: tag.epicOrder,
  }
}
