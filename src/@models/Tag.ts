import { observable } from 'mobx'
import Realm from 'realm'

export class Tag extends Realm.Object {
  public static schema = {
    name: 'Tag',
    properties: {
      _tempSyncId: { type: 'string?', indexed: true },
      _id: { type: 'string?', indexed: true },
      createdAt: { type: 'date', indexed: true },
      updatedAt: { type: 'date', indexed: true },
      deleted: { type: 'bool', indexed: true },

      tag: 'string',
      color: 'string?',
      numberOfUses: { type: 'int', indexed: true, default: 0 },

      epic: 'bool?',
      epicGoal: 'int?',
      epicCompleted: 'bool?',
      epicPoints: 'int?',
    },
  }

  @observable _tempSyncId?: string
  @observable _id?: string
  @observable createdAt = new Date()
  @observable updatedAt = new Date()
  @observable deleted!: boolean

  @observable tag!: string
  @observable color?: string
  @observable numberOfUses!: number

  @observable epic?: boolean
  @observable epicGoal?: number
  @observable epicCompleted?: boolean
  @observable epicPoints?: number
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
  }
}
