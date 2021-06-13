import { hydrateStore } from '@stores/hydration/hydrateStore'
import { hydrate } from '@stores/hydration/hydrate'
import { sharedSync } from '@sync/Sync'
import { getTagById } from '@utils/getTagById'
import { Tag } from '@models/Tag'
import { l } from '@utils/linkify'
import { realm } from '@utils/realm'
import { TodoVM } from '@views/add/TodoVM'
import { computed, makeObservable, observable } from 'mobx'
import uuid from 'uuid'
import { SyncRequestEvent } from '@sync/SyncRequestEvent'
import { persist } from 'mobx-persist'

class TagStore {
  hydrated = false
  @persist('date') @observable updatedAt?: Date

  @observable allTags = realm.objects(Tag)
  @observable tagColorMap = {} as { [index: string]: string }

  @computed get undeletedTags() {
    return this.allTags.filtered('deleted = false').sorted([
      ['numberOfUses', true],
      ['tag', false],
    ])
  }

  @computed get sortedTags() {
    return this.undeletedTags.sorted([
      [`epic`, true],
      [`epicOrder`, false],
    ])
  }

  constructor() {
    makeObservable(this)
    this.refreshTags()
  }

  logout = () => {
    this.updatedAt = undefined
    this.refreshTags()
  }

  refreshTags = () => {
    this.allTags = realm.objects(Tag)
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
    const dbtag = getTagById(epic._id)
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
    sharedSync.sync(SyncRequestEvent.Tag)
  }

  incrementEpicPoints = (text: string) => {
    const tagsInTodo = l(text)
      .filter((c) => c.type === 'hash')
      .map((c) => c.url?.substr(1))
    const epics = this.allTags
      .filtered('epic = true')
      .filter((epic) => tagsInTodo.indexOf(epic.tag) > -1)
    realm.write(() => {
      epics.forEach((epic) => {
        const dbtag = getTagById(epic._id || epic._tempSyncId)
        if (!dbtag || !dbtag.epicGoal) {
          return
        }
        if (!dbtag.epicPoints) {
          dbtag.epicPoints = 0
        }
        if (dbtag.epicPoints < dbtag.epicGoal) dbtag.epicPoints++
        dbtag.updatedAt = new Date()
      })
    })
    this.refreshTags()
    sharedSync.sync(SyncRequestEvent.Tag)
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
          epic: false,
          epicCompleted: false,
          epicGoal: 0,
          epicPoints: 0,
        } as Tag)
      }
    })
    this.refreshTags()
    sharedSync.sync(SyncRequestEvent.Tag)
  }
}

export const sharedTagStore = new TagStore()
hydrate('TagStore', sharedTagStore).then(async () => {
  sharedTagStore.hydrated = true
  hydrateStore('TagStore')
})
