import { MelonTag } from '@models/MelonTag'

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
