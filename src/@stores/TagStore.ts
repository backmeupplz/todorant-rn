import { sockets } from '@utils/sockets'
import { TodoVM } from '@views/add/TodoVM'
import { Tag } from '@models/Tag'
import { realm } from '@utils/realm'
import { observable, computed } from 'mobx'
import { persist } from 'mobx-persist'
import uuid from 'uuid'
import { hydrateStore } from '@utils/hydrated'
import { hydrate } from '@utils/hydrate'
import { l } from '@utils/linkify'
import { realmTimestampFromDate } from '@utils/realmTimestampFromDate'

class TagStore {
  @persist('date') @observable lastSyncDate?: Date

  hydrated = false

  @observable allTags = realm.objects<Tag>(Tag)
  @observable tagColorMap = {} as { [index: string]: string }

  @computed get undeletedTags() {
    return this.allTags.filtered('deleted = false').sorted([
      ['numberOfUses', true],
      ['tag', false],
    ])
  }

  constructor() {
    this.refreshTags()
  }

  logout = () => {
    this.lastSyncDate = undefined
    this.refreshTags()
  }

  onObjectsFromServer = async (
    tagsChangedOnServer: Tag[],
    pushBack: (objects: Tag[]) => Promise<Tag[]>
  ) => {
    if (!this.hydrated) {
      return
    }
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
    const tagsChangedLocally = this.lastSyncDate
      ? this.allTags.filtered(
          `updatedAt > ${realmTimestampFromDate(this.lastSyncDate)}`
        )
      : this.allTags
    // Pull
    for (const serverTag of tagsChangedOnServer) {
      if (!serverTag._id) {
        continue
      }
      let localTag = this.getTagById(serverTag._id)
      if (localTag) {
        if (localTag.updatedAt < serverTag.updatedAt) {
          realm.write(() => {
            if (localTag) {
              Object.assign(localTag, serverTag)
            }
          })
        }
      } else {
        const newTag = {
          ...serverTag,
        }
        realm.write(() => {
          realm.create(Tag, newTag)
        })
      }
    }
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
      sharedTagStore.lastSyncDate = new Date()
      // Refresh
      this.refreshTags()
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
      tagsToPush.map((v) => ({ ...v })) as any
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
        const localTag = this.getTagById(tag._tempSyncId)
        if (localTag) {
          Object.assign(localTag, tag)
        }
      }
    })
    // Refresh
    this.refreshTags()
  }

  refreshTags = () => {
    this.allTags = realm.objects<Tag>(Tag)
    this.tagColorMap = this.allTags
      .filtered('deleted = false')
      .reduce((p, c) => {
        if (c.color) {
          p[c.tag] = c.color
        }
        return p
      }, {} as { [index: string]: string })
  }

  getTagById = (id?: string) => {
    if (!id) {
      return undefined
    }
    const tags = this.allTags.filtered(`_id = "${id}" || _tempSyncId = "${id}"`)
    return tags.length ? tags[0] : undefined
  }

  addTags(vms: TodoVM[]) {
    const tags = vms
      .map((vm) => l(vm.text))
      .reduce((p, c) => p.concat(c), [])
      .filter((c) => c.type === 'hash')
      .map((c) => c.url?.substr(1))
      .filter((c) => !!c) as string[]
    const tagsMap = tags.reduce((p, c) => {
      if (p[c]) {
        p[c]++
      } else {
        p[c] = 1
      }
      return p
    }, {} as { [index: string]: number })
    const dbtagsObjects = this.allTags.filtered('deleted = false')
    realm.write(() => {
      for (const dbtag of dbtagsObjects) {
        if (tagsMap[dbtag.tag]) {
          dbtag.numberOfUses += tagsMap[dbtag.tag]
          dbtag.updatedAt = new Date()
        }
      }
    })
    const dbtags = dbtagsObjects.map((tag) => tag.tag)
    let tagsToAdd = tags.filter((tag) => dbtags.indexOf(tag) < 0)
    const tagsToAddMap = tagsToAdd.reduce((p, c) => {
      p[c] = true
      return p
    }, {} as { [index: string]: boolean })
    tagsToAdd = Object.keys(tagsToAddMap)
    realm.write(() => {
      for (const tag of tagsToAdd) {
        realm.create(Tag, {
          createdAt: new Date(),
          updatedAt: new Date(),
          deleted: false,
          tag,
          _tempSyncId: uuid(),
        })
      }
    })
    this.refreshTags()
    sockets.tagsSyncManager.sync()
  }
}

export const sharedTagStore = new TagStore()
hydrate('TagStore', sharedTagStore).then(() => {
  sharedTagStore.hydrated = true
  hydrateStore('TagStore')
})
