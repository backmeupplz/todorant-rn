import { Tag } from '@models/Tag'
import { Q } from '@nozbe/watermelondb'
import { realm } from '@utils/realm'
import { TagColumn } from './melondb'
import { tagsCollection } from './wmdb'

export async function getTagById(id?: string) {
  if (!id) {
    return undefined
  }
  const tags = await tagsCollection
    .query(Q.or(Q.where(TagColumn._id, id), Q.where(TagColumn._tempSyncId, id)))
    .fetch()
  return tags.length ? tags[0] : undefined
}
