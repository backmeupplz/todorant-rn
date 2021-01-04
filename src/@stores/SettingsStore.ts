import { Settings } from '@models/Settings'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { updateAndroidNavigationBarColor } from '@utils/androidNavigationBar'
import { hydrate } from '@utils/hydrate'
import { hydrateStore } from '@utils/hydrated'
import { getLanguageTag } from '@utils/i18n'
import { computed, observable } from 'mobx'
import { persist } from 'mobx-persist'
import RNRestart from 'react-native-restart'
import { GoogleCalendarCredentials } from '@models/GoogleCalendarCredentials'
import { initialMode, eventEmitter } from 'react-native-dark-mode'

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
  @persist @observable startTimeOfDay?: string
  @persist @observable newTodosGoFirst?: boolean
  @persist @observable preserveOrderByTime?: boolean
  @persist @observable duplicateTagInBreakdown?: boolean
  @persist @observable showMoreByDefault?: boolean
  @persist @observable language?: string
  @persist('object', GoogleCalendarCredentials)
  @observable
  googleCalendarCredentials?: GoogleCalendarCredentials

  @persist @observable colorMode = ColorMode.auto

  @persist @observable askBeforeDelete = true

  @persist @observable soundOn = true
  @persist @observable endOfDaySoundOn = false
  @persist @observable gamificationOn = true
  @persist @observable badgeIconCurrentCount = false
  @persist @observable planningReminderTime?: string
  @persist @observable swipeActions = true

  @computed get firstDayOfWeekSafe() {
    return this.firstDayOfWeek === undefined
      ? this.language === 'en'
        ? 0
        : 1
      : this.firstDayOfWeek
  }

  @computed get startTimeOfDaySafe() {
    return this.startTimeOfDay ? this.startTimeOfDay : '00:00'
  }

  @observable mode = initialMode
  @computed get isDark() {
    return this.colorMode === ColorMode.auto
      ? this.mode === 'dark'
      : this.colorMode === ColorMode.dark
  }

  constructor() {
    eventEmitter.on('currentModeChanged', (newMode) => {
      this.mode = newMode
      updateAndroidNavigationBarColor(this.isDark)
    })
  }

  onObjectsFromServer = async (
    settings: Settings,
    pushBack: (objects: Settings) => Promise<Settings>,
    completeSync: () => void
  ) => {
    if (!this.hydrated) {
      throw new Error("Store didn't hydrate yet")
    }
    // Modify settings
    settings.updatedAt = settings.updatedAt
      ? new Date(settings.updatedAt)
      : undefined
    // First pull
    if (!this.updatedAt) {
      this.showTodayOnAddTodo = settings.showTodayOnAddTodo
      this.firstDayOfWeek = settings.firstDayOfWeek
      this.startTimeOfDay = settings.startTimeOfDay
      this.newTodosGoFirst = settings.newTodosGoFirst
      this.preserveOrderByTime = settings.preserveOrderByTime
      this.duplicateTagInBreakdown = settings.duplicateTagInBreakdown
      this.showMoreByDefault = settings.showMoreByDefault
      this.language = settings.language
      this.googleCalendarCredentials = settings.googleCalendarCredentials
      if (settings.updatedAt) {
        this.updatedAt = new Date(settings.updatedAt)
      } else {
        const pushedSettings = await pushBack({
          showTodayOnAddTodo: this.showTodayOnAddTodo,
          firstDayOfWeek: this.firstDayOfWeek,
          startTimeOfDay: this.startTimeOfDay,
          newTodosGoFirst: this.newTodosGoFirst,
          preserveOrderByTime: this.preserveOrderByTime,
          duplicateTagInBreakdown: this.duplicateTagInBreakdown,
          showMoreByDefault: this.showMoreByDefault,
          language: this.language,
          googleCalendarCredentials: this.googleCalendarCredentials,
        })
        this.showTodayOnAddTodo = pushedSettings.showTodayOnAddTodo
        this.firstDayOfWeek = pushedSettings.firstDayOfWeek
        this.startTimeOfDay = pushedSettings.startTimeOfDay
        this.newTodosGoFirst = pushedSettings.newTodosGoFirst
        this.preserveOrderByTime = pushedSettings.preserveOrderByTime
        this.duplicateTagInBreakdown = pushedSettings.duplicateTagInBreakdown
        this.showMoreByDefault = pushedSettings.showMoreByDefault
        this.language = pushedSettings.language
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
        startTimeOfDay: this.startTimeOfDay,
        newTodosGoFirst: this.newTodosGoFirst,
        preserveOrderByTime: this.preserveOrderByTime,
        duplicateTagInBreakdown: this.duplicateTagInBreakdown,
        showMoreByDefault: this.showMoreByDefault,
        language: this.language,
        googleCalendarCredentials: this.googleCalendarCredentials,
      })
      this.showTodayOnAddTodo = pushedSettings.showTodayOnAddTodo
      this.firstDayOfWeek = pushedSettings.firstDayOfWeek
      this.startTimeOfDay = pushedSettings.startTimeOfDay
      this.newTodosGoFirst = pushedSettings.newTodosGoFirst
      this.preserveOrderByTime = pushedSettings.preserveOrderByTime
      this.duplicateTagInBreakdown = pushedSettings.duplicateTagInBreakdown
      this.showMoreByDefault = pushedSettings.showMoreByDefault
      this.language = pushedSettings.language
      this.googleCalendarCredentials = pushedSettings.googleCalendarCredentials
      this.updatedAt = pushedSettings.updatedAt
        ? new Date(pushedSettings.updatedAt)
        : undefined
    }
    // Consequent pull
    else if (this.updatedAt < settings.updatedAt) {
      if (settings.language !== this.language && settings.language) {
        await AsyncStorage.setItem('languageSelect', settings.language)
        RNRestart.Restart()
      }
      this.showTodayOnAddTodo = settings.showTodayOnAddTodo
      this.firstDayOfWeek = settings.firstDayOfWeek
      this.startTimeOfDay = settings.startTimeOfDay
      this.newTodosGoFirst = settings.newTodosGoFirst
      this.preserveOrderByTime = settings.preserveOrderByTime
      this.duplicateTagInBreakdown = settings.duplicateTagInBreakdown
      this.showMoreByDefault = settings.showMoreByDefault
      this.language = settings.language
      this.googleCalendarCredentials = settings.googleCalendarCredentials
      this.updatedAt = new Date(settings.updatedAt)
    }
    // Consequent push
    else if (this.updatedAt > settings.updatedAt) {
      const pushedSettings = await pushBack({
        showTodayOnAddTodo: this.showTodayOnAddTodo,
        firstDayOfWeek: this.firstDayOfWeek,
        startTimeOfDay: this.startTimeOfDay,
        newTodosGoFirst: this.newTodosGoFirst,
        preserveOrderByTime: this.preserveOrderByTime,
        duplicateTagInBreakdown: this.duplicateTagInBreakdown,
        showMoreByDefault: this.showMoreByDefault,
        language: this.language,
        googleCalendarCredentials: this.googleCalendarCredentials,
      })
      this.showTodayOnAddTodo = pushedSettings.showTodayOnAddTodo
      this.firstDayOfWeek = pushedSettings.firstDayOfWeek
      this.startTimeOfDay = pushedSettings.startTimeOfDay
      this.newTodosGoFirst = pushedSettings.newTodosGoFirst
      this.preserveOrderByTime = pushedSettings.preserveOrderByTime
      this.duplicateTagInBreakdown = pushedSettings.duplicateTagInBreakdown
      this.showMoreByDefault = pushedSettings.showMoreByDefault
      this.language = pushedSettings.language
      this.googleCalendarCredentials = pushedSettings.googleCalendarCredentials
      this.updatedAt = pushedSettings.updatedAt
        ? new Date(pushedSettings.updatedAt)
        : undefined
    }
    completeSync()
  }

  logout = () => {
    this.showTodayOnAddTodo = undefined
    this.firstDayOfWeek = undefined
    this.startTimeOfDay = undefined
    this.newTodosGoFirst = undefined
    this.preserveOrderByTime = undefined
    this.duplicateTagInBreakdown = undefined
    this.showMoreByDefault = undefined
    this.language = undefined
    this.googleCalendarCredentials = undefined
    this.updatedAt = undefined
    this.soundOn = true
    this.endOfDaySoundOn = false
  }
}

export const sharedSettingsStore = new SettingsStore()
hydrate('SettingsStore', sharedSettingsStore).then(async () => {
  sharedSettingsStore.hydrated = true
  hydrateStore('SettingsStore')
  sharedSettingsStore.language = await getLanguageTag()
  updateAndroidNavigationBarColor(sharedSettingsStore.isDark)
})
