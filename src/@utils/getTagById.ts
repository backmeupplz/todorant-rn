import { Tag } from '@models/Tag'
import { realm } from '@utils/realm'

export function getTagById(id?: string) {
  if (!id) {
    return undefined
  }
  const tags = realm
    .objects(Tag)
    .filtered(`_id = "${id}" || _tempSyncId = "${id}"`)
  return tags.length ? tags[0] : undefined
}
