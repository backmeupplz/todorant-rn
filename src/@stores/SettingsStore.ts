import { Settings } from '@models/Settings'
import { persist } from 'mobx-persist'
import { observable } from 'mobx'
import { hydrateStore } from '@utils/hydrated'
import { hydrate } from '@utils/hydrate'

class SettingsStore {
  hydrated = false

  @persist('date') @observable lastSyncDate?: Date

  @persist showTodayOnAddTodo?: boolean
  @persist firstDayOfWeek?: number
  @persist newTodosGoFirst?: boolean

  onObjectsFromServer = async (
    settings: Settings,
    pushBack: (objects: Settings) => Promise<Settings>
  ) => {
    if (!this.hydrated) {
      return
    }
    // First pull
    if (!this.lastSyncDate) {
      this.showTodayOnAddTodo = settings.showTodayOnAddTodo
      this.firstDayOfWeek = settings.firstDayOfWeek
      this.newTodosGoFirst = settings.newTodosGoFirst
      if (settings.updatedAt) {
        this.lastSyncDate = new Date(settings.updatedAt)
      } else {
        const pushedSettings = await pushBack({
          showTodayOnAddTodo: this.showTodayOnAddTodo,
          firstDayOfWeek: this.firstDayOfWeek,
          newTodosGoFirst: this.newTodosGoFirst,
        })
        this.showTodayOnAddTodo = pushedSettings.showTodayOnAddTodo
        this.firstDayOfWeek = pushedSettings.firstDayOfWeek
        this.newTodosGoFirst = pushedSettings.newTodosGoFirst
        this.lastSyncDate = pushedSettings.updatedAt ? new Date(pushedSettings.updatedAt) : undefined
      }
    }
    // First push
    else if (!settings.updatedAt) {
      const pushedSettings = await pushBack({
        showTodayOnAddTodo: this.showTodayOnAddTodo,
        firstDayOfWeek: this.firstDayOfWeek,
        newTodosGoFirst: this.newTodosGoFirst,
      })
      this.showTodayOnAddTodo = pushedSettings.showTodayOnAddTodo
      this.firstDayOfWeek = pushedSettings.firstDayOfWeek
      this.newTodosGoFirst = pushedSettings.newTodosGoFirst
      this.lastSyncDate = pushedSettings.updatedAt ? new Date(pushedSettings.updatedAt) : undefined
    }
    // Consequent pull
    else if (this.lastSyncDate < settings.updatedAt) {
      this.showTodayOnAddTodo = settings.showTodayOnAddTodo
      this.firstDayOfWeek = settings.firstDayOfWeek
      this.newTodosGoFirst = settings.newTodosGoFirst
      this.lastSyncDate = new Date(settings.updatedAt)
    }
    // Consequent push
    else if (this.lastSyncDate > settings.updatedAt) {
      const pushedSettings = await pushBack({
        showTodayOnAddTodo: this.showTodayOnAddTodo,
        firstDayOfWeek: this.firstDayOfWeek,
        newTodosGoFirst: this.newTodosGoFirst,
      })
      this.showTodayOnAddTodo = pushedSettings.showTodayOnAddTodo
      this.firstDayOfWeek = pushedSettings.firstDayOfWeek
      this.newTodosGoFirst = pushedSettings.newTodosGoFirst
      this.lastSyncDate = pushedSettings.updatedAt ? new Date(pushedSettings.updatedAt) : undefined
    }
  }

  logout = () => {
    this.showTodayOnAddTodo = undefined
    this.firstDayOfWeek = undefined
    this.newTodosGoFirst = undefined
    this.lastSyncDate = undefined
  }
}

export const sharedSettingsStore = new SettingsStore()
hydrate('SettingsStore', sharedSettingsStore).then(() => {
  sharedSettingsStore.hydrated = true
  hydrateStore('SettingsStore')
})
