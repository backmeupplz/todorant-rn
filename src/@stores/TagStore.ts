import { cloneTag, Tag } from '@models/Tag'
import { hydrate } from '@utils/hydrate'
import { hydrateStore } from '@utils/hydrated'
import { l } from '@utils/linkify'
import { realm } from '@utils/realm'
import { realmTimestampFromDate } from '@utils/realmTimestampFromDate'
import { sockets } from '@utils/sockets'
import { TodoVM } from '@views/add/TodoVM'
import { computed, observable } from 'mobx'
import { persist } from 'mobx-persist'
import uuid from 'uuid'

class TagStore {
  @persist('date') @observable lastSyncDate?: Date

  hydrated = false

  @observable allTags = realm.objects<Tag>('Tag')
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
    pushBack: (objects: Tag[]) => Promise<Tag[]>,
    completeSync: () => void
  ) => {
    if (!this.hydrated) {
      throw new Error("Store didn't hydrate yet")
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
          realm.create('Tag', newTag)
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
      // Complete sync
      completeSync()
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
        const localTag = this.getTagById(tag._tempSyncId)
        if (localTag) {
          Object.assign(localTag, tag)
        }
      }
    })
    // Complete sync
    completeSync()
    this.refreshTags()
  }

  refreshTags = () => {
    this.allTags = realm.objects<Tag>('Tag')
    this.tagColorMap = this.allTags
      .filtered('deleted = false')
      .reduce((p, c) => {
        if (c.color) {
          p[c.tag] = c.color
        }
        return p
      }, {} as { [index: string]: string })
  }

  completeEpic = (epic: Tag) => {
    const dbtag = this.getTagById(epic._id)
    if (!dbtag) {
      return
    }
    realm.write(() => {
      dbtag.epic = false
      dbtag.epicPoints = 0
      dbtag.epicGoal = 0
      dbtag.epicCompleted = true
      dbtag.updatedAt = new Date()
    })
    this.refreshTags()
    sockets.tagsSyncManager.sync()
  }

  incrementEpicPoints = (text: string) => {
    const tagsInTodo = l(text)
      .filter((c) => c.type === 'hash')
      .map((c) => c.url?.substr(1))
    const epics = this.allTags
      .filtered('epic = true')
      .filter((epic) => tagsInTodo.indexOf(epic.tag) > -1)
    epics.forEach((epic) => {
      const dbtag = this.getTagById(epic._id)
      realm.write(() => {
        if (!dbtag || !dbtag.epicGoal) {
          return
        }
        if (!dbtag.epicPoints) {
          dbtag.epicPoints = 0
        }
        if (dbtag.epicPoints < dbtag.epicGoal) dbtag.epicPoints!++
        dbtag.updatedAt = new Date()
      })
    })
    this.refreshTags()
    sockets.tagsSyncManager.sync()
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
        realm.create('Tag', {
          createdAt: new Date(),
          updatedAt: new Date(),
          deleted: false,
          tag,
          _tempSyncId: uuid(),
          epic: false,
          epicCompleted: false,
          epicGoal: 0,
          epicPoints: 0,
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
