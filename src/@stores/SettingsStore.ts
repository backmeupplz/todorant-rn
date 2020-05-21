import { GoogleCalendarCredentials } from './../@models/GoogleCalendarCredentials'
import { Settings } from '@models/Settings'
import { persist } from 'mobx-persist'
import { observable, computed } from 'mobx'
import { hydrateStore } from '@utils/hydrated'
import { hydrate } from '@utils/hydrate'
import { getLanguageTag } from '@utils/i18n'

export enum Language {
  auto = 'auto',
  ru = 'ru',
  en = 'en',
  uk = 'uk',
  it = 'it',
  es = 'es',
  'pt-BR' = 'pt-BR',
}

export enum ColorMode {
  auto = 'auto',
  dark = 'dark',
  light = 'light',
}

class SettingsStore {
  hydrated = false

  @persist('date') @observable updatedAt?: Date

  @persist @observable showTodayOnAddTodo?: boolean
  @persist @observable firstDayOfWeek?: number
  @persist @observable newTodosGoFirst?: boolean
  @persist @observable preserveOrderByTime?: boolean
  @persist('object', GoogleCalendarCredentials)
  @observable
  googleCalendarCredentials?: GoogleCalendarCredentials

  @observable language = 'en'
  @persist @observable colorMode = ColorMode.auto

  @persist @observable askBeforeDelete = true

  @persist @observable soundOn = true
  @persist @observable gamificationOn = true

  @computed get firstDayOfWeekSafe() {
    return this.firstDayOfWeek === undefined
      ? this.language === 'en'
        ? 0
        : 1
      : this.firstDayOfWeek
  }

  onObjectsFromServer = async (
    settings: Settings,
    pushBack: (objects: Settings) => Promise<Settings>
  ) => {
    if (!this.hydrated) {
      return
    }
    // Modify settings
    settings.updatedAt = settings.updatedAt
      ? new Date(settings.updatedAt)
      : undefined
    // First pull
    if (!this.updatedAt) {
      this.showTodayOnAddTodo = settings.showTodayOnAddTodo
      this.firstDayOfWeek = settings.firstDayOfWeek
      this.newTodosGoFirst = settings.newTodosGoFirst
      this.preserveOrderByTime = settings.preserveOrderByTime
      this.googleCalendarCredentials = settings.googleCalendarCredentials
      if (settings.updatedAt) {
        this.updatedAt = new Date(settings.updatedAt)
      } else {
        const pushedSettings = await pushBack({
          showTodayOnAddTodo: this.showTodayOnAddTodo,
          firstDayOfWeek: this.firstDayOfWeek,
          newTodosGoFirst: this.newTodosGoFirst,
          preserveOrderByTime: this.preserveOrderByTime,
          googleCalendarCredentials: this.googleCalendarCredentials,
        })
        this.showTodayOnAddTodo = pushedSettings.showTodayOnAddTodo
        this.firstDayOfWeek = pushedSettings.firstDayOfWeek
        this.newTodosGoFirst = pushedSettings.newTodosGoFirst
        this.preserveOrderByTime = pushedSettings.preserveOrderByTime
        this.googleCalendarCredentials =
          pushedSettings.googleCalendarCredentials
        this.updatedAt = pushedSettings.updatedAt
          ? new Date(pushedSettings.updatedAt)
          : undefined
      }
    }
    // First push
    else if (!settings.updatedAt) {
      const pushedSettings = await pushBack({
        showTodayOnAddTodo: this.showTodayOnAddTodo,
        firstDayOfWeek: this.firstDayOfWeek,
        newTodosGoFirst: this.newTodosGoFirst,
        preserveOrderByTime: this.preserveOrderByTime,
        googleCalendarCredentials: this.googleCalendarCredentials,
      })
      this.showTodayOnAddTodo = pushedSettings.showTodayOnAddTodo
      this.firstDayOfWeek = pushedSettings.firstDayOfWeek
      this.newTodosGoFirst = pushedSettings.newTodosGoFirst
      this.preserveOrderByTime = pushedSettings.preserveOrderByTime
      this.googleCalendarCredentials = pushedSettings.googleCalendarCredentials
      this.updatedAt = pushedSettings.updatedAt
        ? new Date(pushedSettings.updatedAt)
        : undefined
    }
    // Consequent pull
    else if (this.updatedAt < settings.updatedAt) {
      this.showTodayOnAddTodo = settings.showTodayOnAddTodo
      this.firstDayOfWeek = settings.firstDayOfWeek
      this.newTodosGoFirst = settings.newTodosGoFirst
      this.preserveOrderByTime = settings.preserveOrderByTime
      this.googleCalendarCredentials = settings.googleCalendarCredentials
      this.updatedAt = new Date(settings.updatedAt)
    }
    // Consequent push
    else if (this.updatedAt > settings.updatedAt) {
      const pushedSettings = await pushBack({
        showTodayOnAddTodo: this.showTodayOnAddTodo,
        firstDayOfWeek: this.firstDayOfWeek,
        newTodosGoFirst: this.newTodosGoFirst,
        preserveOrderByTime: this.preserveOrderByTime,
        googleCalendarCredentials: this.googleCalendarCredentials,
      })
      this.showTodayOnAddTodo = pushedSettings.showTodayOnAddTodo
      this.firstDayOfWeek = pushedSettings.firstDayOfWeek
      this.newTodosGoFirst = pushedSettings.newTodosGoFirst
      this.preserveOrderByTime = pushedSettings.preserveOrderByTime
      this.googleCalendarCredentials = pushedSettings.googleCalendarCredentials
      this.updatedAt = pushedSettings.updatedAt
        ? new Date(pushedSettings.updatedAt)
        : undefined
    }
  }

  logout = () => {
    this.showTodayOnAddTodo = undefined
    this.firstDayOfWeek = undefined
    this.newTodosGoFirst = undefined
    this.preserveOrderByTime = undefined
    this.googleCalendarCredentials = undefined
    this.updatedAt = undefined
    this.soundOn = true
  }
}

export const sharedSettingsStore = new SettingsStore()
hydrate('SettingsStore', sharedSettingsStore).then(async () => {
  sharedSettingsStore.hydrated = true
  hydrateStore('SettingsStore')
  sharedSettingsStore.language = await getLanguageTag()
})
