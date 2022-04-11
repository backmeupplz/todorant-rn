import { MelonTag } from '@models/MelonTag'
import { Q } from '@nozbe/watermelondb'
import { SyncRequestEvent } from '@sync/SyncRequestEvent'
import { TagColumn } from '@utils/watermelondb/tables'
import { TodoVM } from '@views/add/TodoVM'
import { database, tagsCollection } from '@utils/watermelondb/wmdb'
import { hydrate } from '@stores/hydration/hydrate'
import { hydrateStore } from '@stores/hydration/hydrateStore'
import { l } from '@utils/linkify'
import { makeObservable, observable } from 'mobx'
import { persist } from 'mobx-persist'
import { sharedSync } from '@sync/Sync'

class TagStore {
  hydrated = false
  @persist('date') @observable updatedAt?: Date

  @observable tagColorMap = {} as { [index: string]: string }

  @observable undeletedTagsCount = 0

  undeletedTags = tagsCollection.query(
    Q.where(TagColumn.deleted, false),
    Q.sortBy(TagColumn.epic, Q.desc),
    Q.sortBy(TagColumn.epicOrder, Q.asc),
    Q.sortBy(TagColumn.numberOfUses, Q.desc),
    Q.sortBy(TagColumn.tag, Q.asc)
  )

  epics = this.undeletedTags.extend(Q.where(TagColumn.epic, true))

  constructor() {
    makeObservable(this)
    this.refreshTags()
    this.undeletedTags
      .observeCount(false)
      .subscribe((count) => (this.undeletedTagsCount = count))
  }

  logout = () => {
    this.updatedAt = undefined
    this.refreshTags()
  }

  refreshTags = async () => {
    this.tagColorMap = (
      await tagsCollection.query(Q.where(TagColumn.deleted, false)).fetch()
    ).reduce((p, c) => {
      if (c.color) {
        p[c.tag] = c.color
      }
      return p
    }, {} as { [index: string]: string })
  }

  completeEpic = async (epic: MelonTag) => {
    await epic.completeEpic('completing epic')
    await this.refreshTags()
    sharedSync.sync(SyncRequestEvent.Tag)
  }

  incrementEpicPoints = async (text: string, sync = true) => {
    const tagsInTodo = l(text)
      .filter((c) => c.type === 'hash')
      .map((c) => c.url?.substr(1))
    const epics = (await this.epics.fetch()).filter(
      (epic) => tagsInTodo.indexOf(epic.tag) > -1
    )
    const toUpdate = [] as MelonTag[]
    epics.forEach((epic) => {
      if (!epic.epicGoal) {
        return
      }
      const epicPoints = epic.epicPoints ?? 0
      if (epicPoints < epic.epicGoal)
        toUpdate.push(
          epic.prepareUpdateWithDescription((epic) => {
            if (!epic.epicPoints) epic.epicPoints = 0
            epic.epicPoints++
          }, 'adding epic points')
        )
    })
    await database.write(async () => await database.batch(...toUpdate))
    await this.refreshTags()
    if (sync) {
      sharedSync.sync(SyncRequestEvent.Tag)
    }
  }

  async addTags(vms: TodoVM[], sync = true) {
    const toUpdate = [] as MelonTag[]
    const toCreate = [] as MelonTag[]
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
    const dbtagsObjects = await this.undeletedTags.fetch()
    for (const dbtag of dbtagsObjects) {
      if (tagsMap[dbtag.tag]) {
        toUpdate.push(
          dbtag.prepareUpdateWithDescription(
            (tag) => (tag.numberOfUses += tagsMap[dbtag.tag]),
            'adding number of usage'
          )
        )
      }
    }
    const dbtags = dbtagsObjects.map((tag) => tag.tag)
    let tagsToAdd = tags.filter((tag) => dbtags.indexOf(tag) < 0)
    const tagsToAddMap = tagsToAdd.reduce((p, c) => {
      p[c] = true
      return p
    }, {} as { [index: string]: boolean })
    tagsToAdd = Object.keys(tagsToAddMap)
    for (const tag of tagsToAdd) {
      toCreate.push(
        tagsCollection.prepareCreate((tagToCreate) => {
          tagToCreate.tag = tag
          tagToCreate.epicPoints = 0
        })
      )
    }
    await database.write(
      async () => await database.batch(...toUpdate, ...toCreate)
    )
    this.refreshTags()
    if (sync) {
      sharedSync.sync(SyncRequestEvent.Tag)
    }
  }
}

export const sharedTagStore = new TagStore()
hydrate('TagStore', sharedTagStore).then(async () => {
  sharedTagStore.hydrated = true
  hydrateStore('TagStore')
})
