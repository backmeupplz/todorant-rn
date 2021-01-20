import { realm } from '@utils/realm'
import { MobxRealmModel } from '@utils/mobx-realm/model'

export class Tag extends MobxRealmModel {
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

  objectSchema() {
    return Tag.schema
  }

  _tempSyncId?: string
  _id?: string
  createdAt = new Date()
  updatedAt = new Date()
  deleted!: boolean

  tag!: string
  color?: string
  numberOfUses!: number

  epic?: boolean
  epicGoal?: number
  epicCompleted?: boolean
  epicPoints?: number
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

export function getTagById(id?: string) {
  if (!id) {
    return undefined
  }
  const tags = realm
    .objects<Tag>('Tag')
    .filtered(`_id = "${id}" || _tempSyncId = "${id}"`)
  return tags.length ? tags[0] : undefined
}
