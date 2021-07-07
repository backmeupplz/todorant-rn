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
import { database, tagsCollection } from '@utils/wmdb'
import { Q } from '@nozbe/watermelondb'
import { MelonTodo } from '@models/MelonTodo'
import { MelonTag } from '@models/MelonTag'

class TagStore {
  hydrated = false
  @persist('date') @observable updatedAt?: Date

  @observable tagColorMap = {} as { [index: string]: string }

  undeletedTags = tagsCollection.query(
    Q.where('is_deleted', false),
    Q.experimentalSortBy('is_epic', Q.desc),
    Q.experimentalSortBy('epic_order', Q.asc),
    Q.experimentalSortBy('number_of_uses', Q.desc),
    Q.experimentalSortBy('tag', Q.asc)
  )

  epics = this.undeletedTags.extend(Q.where('is_epic', true))

  constructor() {
    makeObservable(this)
    this.refreshTags()
  }

  logout = () => {
    this.updatedAt = undefined
    this.refreshTags()
  }

  refreshTags = async () => {
    this.tagColorMap = (
      await tagsCollection.query(Q.where('is_deleted', false)).fetch()
    ).reduce((p, c) => {
      if (c.color) {
        p[c.tag] = c.color
      }
      return p
    }, {} as { [index: string]: string })
  }

  completeEpic = async (epic: MelonTag) => {
    await epic.completeEpic()
    await this.refreshTags()
    sharedSync.sync(SyncRequestEvent.Tag)
  }

  incrementEpicPoints = async (text: string) => {
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
      if (!epic.epicPoints) epic.epicPoints = 0
      if (epic.epicPoints < epic.epicGoal)
        toUpdate.push(
          epic.prepareUpdate((epic) => {
            if (!epic.epicPoints) epic.epicPoints = 0
            epic.epicPoints++
          })
        )
    })
    await database.write(async () => await database.batch(...toUpdate))
    await this.refreshTags()
    sharedSync.sync(SyncRequestEvent.Tag)
  }

  async addTags(vms: TodoVM[]) {
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
          dbtag.prepareUpdate((tag) => (tag.numberOfUses += tagsMap[dbtag.tag]))
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
    sharedSync.sync(SyncRequestEvent.Tag)
  }
}

export const sharedTagStore = new TagStore()
hydrate('TagStore', sharedTagStore).then(async () => {
  sharedTagStore.hydrated = true
  hydrateStore('TagStore')
})
