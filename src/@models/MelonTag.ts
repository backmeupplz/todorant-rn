import { Model } from '@nozbe/watermelondb'
import {
  action,
  date,
  field,
  readonly,
  relation,
  writer,
} from '@nozbe/watermelondb/decorators'
import { Tables, TagColumn } from '@utils/melondb'

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

  @writer async completeEpic() {
    await this.update((tag) => {
      tag.epic = false
      tag.epicPoints = 0
      tag.epicGoal = 0
      tag.epicCompleted = true
    })
  }

  @writer async delete() {
    await this.update((tag) => (tag.deleted = true))
  }

  @writer async turnTagToEpic(goal: number) {
    await this.update((tag) => {
      tag.epic = true
      tag.epicGoal = goal
      tag.epicPoints = 0
    })
  }

  @writer async changeColor(color: string) {
    await this.update((tag) => (tag.color = color))
  }

  @writer async changeText(text: string) {
    await this.update((tag) => (tag.tag = text))
  }

  @writer async setServerId(serverId: string) {
    await this.update((tag) => (tag._id = serverId))
  }

  @writer async unEpic() {
    await this.update((tag) => {
      tag.epicCompleted = false
      tag.epicGoal = 0
      tag.epicOrder = 0
      tag.epicPoints = 0
      tag.epic = false
    })
  }
}

export function cloneTag(tag: MelonTag) {
  return {
    _tempSyncId: tag._tempSyncId,
    _id: tag._id,
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
