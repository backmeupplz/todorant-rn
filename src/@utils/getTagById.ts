import { Q } from '@nozbe/watermelondb'
import { TagColumn } from 'src/@utils/watermelondb/tables'
import { tagsCollection } from 'src/@utils/watermelondb/wmdb'

export async function getTagById(id?: string) {
  if (!id) {
    return undefined
  }
  const tags = await tagsCollection
    .query(Q.or(Q.where(TagColumn._id, id), Q.where(TagColumn._tempSyncId, id)))
    .fetch()
  return tags.length ? tags[0] : undefined
}
