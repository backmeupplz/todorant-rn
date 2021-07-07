import { Model } from '@nozbe/watermelondb'
import {
  action,
  date,
  field,
  readonly,
  relation,
  writer,
} from '@nozbe/watermelondb/decorators'

export class MelonTag extends Model {
  static table = 'tags'

  @field('server_id') _id?: string
  @field('id') _tempSyncId!: string
  @readonly @date('created_at') readonly createdAt!: Date
  @readonly @date('updated_at') readonly updatedAt!: Date
  @field('is_deleted') deleted?: boolean
  @field('tag') tag!: string
  @field('color') color?: string
  @field('number_of_uses') numberOfUses!: number
  @field('is_epic') epic?: boolean
  @field('epic_goal') epicGoal?: number
  @field('is_epic_completed') epicCompleted?: boolean
  @field('epic_points') epicPoints?: number
  @field('epic_order') epicOrder?: number

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

  @writer async changeColorToDefault() {
    await this.update((tag) => (tag.color = ''))
  }

  @writer async turnTagToEpic(goal: number) {
    await this.update((tag) => {
      tag.epic = true
      tag.epicGoal = goal
    })
  }

  @writer async changeColor(color: string) {
    await this.update((tag) => (tag.color = color))
  }
}

export function cloneTag(tag: Tag) {
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
