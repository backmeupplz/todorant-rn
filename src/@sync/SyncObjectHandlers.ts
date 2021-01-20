import { realmTimestampFromDate } from '@utils/realmTimestampFromDate'
import { Tag, cloneTag, getTagById } from '@models/Tag'
import { DelegationUser, DelegationUserType } from '@models/DelegationUser'
import { realm } from '@utils/realm'
import AsyncStorage from '@react-native-async-storage/async-storage'
import uuid from 'uuid'

export enum LastSyncDateType {
  Tags = 'Tags',
}

export async function getLastSyncDate(type: LastSyncDateType) {
  const lastSyncTimestamp = AsyncStorage.getItem(type)
  return lastSyncTimestamp ? new Date(lastSyncTimestamp) : undefined
}

export async function updateLastSyncDate(
  type: LastSyncDateType,
  date = new Date()
) {
  return AsyncStorage.setItem(type, date.getTime())
}

export async function onDelegationObjectsFromServer(
  objects: any,
  completeSync: () => void
) {
  // Remove all
  realm.write(() => {
    realm.delete(realm.objects<DelegationUser>('DelegationUser'))
  })
  // Sync delegates
  realm.write(() => {
    for (const delegate of objects.delegates) {
      realm.create('DelegationUser', {
        ...delegate,
        delegationType: DelegationUserType.delegate,
      })
    }
  })
  // Sync delegators
  realm.write(() => {
    for (const delegator of objects.delegators) {
      realm.create('DelegationUser', {
        ...delegator,
        delegationType: DelegationUserType.delegator,
      })
    }
  })
  // Complete sync
  completeSync()
}

export async function onTagsObjectsFromServer(
  tagsChangedOnServer: Tag[],
  pushBack: (objects: Tag[]) => Promise<Tag[]>,
  completeSync: () => void
) {
  // Modify dates
  tagsChangedOnServer.forEach((tag) => {
    tag.updatedAt = new Date(tag.updatedAt)
    tag.createdAt = new Date(tag.createdAt)
  })
  // Get variables
  const serverTagsMap = tagsChangedOnServer.reduce((p, c) => {
    if (c._id) {
      p[c._id] = c
    }
    return p
  }, {} as { [index: string]: Tag })
  const allTags = realm.objects<Tag>('Tag')
  const lastSyncDate = await getLastSyncDate(LastSyncDateType.Tags)
  const tagsChangedLocally = lastSyncDate
    ? allTags.filtered(`updatedAt > ${realmTimestampFromDate(lastSyncDate)}`)
    : allTags
  // Pull
  realm.write(() => {
    for (const serverTag of tagsChangedOnServer) {
      if (!serverTag._id) {
        continue
      }
      let localTag = getTagById(serverTag._id)
      if (localTag) {
        if (localTag.updatedAt < serverTag.updatedAt) {
          if (localTag) {
            Object.assign(localTag, serverTag)
          }
        }
      } else {
        const newTag = {
          ...serverTag,
        }
        realm.create('Tag', newTag)
      }
    }
  })
  // Push
  const tagsToPush = tagsChangedLocally.filter((tag) => {
    if (!tag._id) {
      return true
    }
    const serverTag = serverTagsMap[tag._id]
    if (serverTag) {
      return tag.updatedAt > serverTag.updatedAt
    } else {
      return true
    }
  })
  if (!tagsToPush.length) {
    // Complete sync
    completeSync()
    return
  }
  realm.write(() => {
    for (const tagToPush of tagsToPush) {
      if (!tagToPush._tempSyncId) {
        tagToPush._tempSyncId = uuid()
      }
    }
  })
  const savedPushedTags = await pushBack(
    tagsToPush.map((v) => ({ ...cloneTag(v) })) as any
  )
  // Modify dates
  savedPushedTags.forEach((tag) => {
    tag.updatedAt = new Date(tag.updatedAt)
    tag.createdAt = new Date(tag.createdAt)
  })
  realm.write(() => {
    for (const tag of savedPushedTags) {
      if (!tag._tempSyncId) {
        continue
      }
      const localTag = getTagById(tag._tempSyncId)
      if (localTag) {
        Object.assign(localTag, tag)
      }
    }
  })
  // Complete sync
  completeSync()
}
