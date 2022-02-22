import { Q } from '@nozbe/watermelondb'
import { TagColumn } from './watermelondb/tables'
import { tagsCollection } from './watermelondb/wmdb'

export async function getTagById(id?: string) {
  if (!id) {
    return undefined
  }
  const tags = await tagsCollection
    .query(Q.or(Q.where(TagColumn._id, id), Q.where(TagColumn._tempSyncId, id)))
    .fetch()
  return tags.length ? tags[0] : undefined
}
