import { AsyncStorage } from 'react-native'
import { GoogleCalendarCredentials } from '@models/GoogleCalendarCredentials'
import { MMKV, hydrate } from '@stores/hydration/hydrate'
import { Settings } from '@models/Settings'
import { computed, makeObservable, observable } from 'mobx'
import { eventEmitter, initialMode } from 'react-native-dark-mode'
import { getLanguageTag } from '@utils/i18n'
import { hydrateStore } from '@stores/hydration/hydrateStore'
import { persist } from 'mobx-persist'
import { updateAndroidNavigationBarColor } from '@utils/androidNavigationBar'
import ReactNativeRestart from 'react-native-restart'

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
  @persist @observable removeCompletedFromCalendar?: boolean
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
    makeObservable(this)
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
      this.removeCompletedFromCalendar = settings.removeCompletedFromCalendar
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
          removeCompletedFromCalendar: this.removeCompletedFromCalendar,
        })
        this.showTodayOnAddTodo = pushedSettings.showTodayOnAddTodo
        this.firstDayOfWeek = pushedSettings.firstDayOfWeek
        this.startTimeOfDay = pushedSettings.startTimeOfDay
        this.newTodosGoFirst = pushedSettings.newTodosGoFirst
        this.preserveOrderByTime = pushedSettings.preserveOrderByTime
        this.duplicateTagInBreakdown = pushedSettings.duplicateTagInBreakdown
        this.showMoreByDefault = pushedSettings.showMoreByDefault
        this.language = pushedSettings.language
        this.removeCompletedFromCalendar =
          pushedSettings.removeCompletedFromCalendar
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
        removeCompletedFromCalendar: this.removeCompletedFromCalendar,
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
      this.removeCompletedFromCalendar =
        pushedSettings.removeCompletedFromCalendar
      this.googleCalendarCredentials = pushedSettings.googleCalendarCredentials
      this.updatedAt = pushedSettings.updatedAt
        ? new Date(pushedSettings.updatedAt)
        : undefined
    }
    // Consequent pull
    else if (this.updatedAt < settings.updatedAt) {
      if (settings.language !== this.language && settings.language) {
        await MMKV.setItem('languageSelect', settings.language)
      }
      this.showTodayOnAddTodo = settings.showTodayOnAddTodo
      this.firstDayOfWeek = settings.firstDayOfWeek
      this.startTimeOfDay = settings.startTimeOfDay
      this.newTodosGoFirst = settings.newTodosGoFirst
      this.preserveOrderByTime = settings.preserveOrderByTime
      this.duplicateTagInBreakdown = settings.duplicateTagInBreakdown
      this.showMoreByDefault = settings.showMoreByDefault
      this.language = settings.language
      this.removeCompletedFromCalendar = settings.removeCompletedFromCalendar
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
        removeCompletedFromCalendar: this.removeCompletedFromCalendar,
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
      this.removeCompletedFromCalendar =
        pushedSettings.removeCompletedFromCalendar
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
    this.removeCompletedFromCalendar = undefined
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

export async function fixDuplicatedTasks() {
  const newAsyncStorage = AsyncStorage
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const oldAsyncStorage = require('@react-native-async-storage/async-storage')
    .default as typeof AsyncStorage
  const mmkvStorage = MMKV

  const userInMMKVStorage = JSON.parse(
    (await mmkvStorage.getItem('SessionStore')) || '{}'
  ).user

  if (userInMMKVStorage) {
    return
  }

  const userInOldAsyncStorage = JSON.parse(
    (await oldAsyncStorage.getItem('SessionStore')) || '{}'
  ).user

  const userInNewAsyncStorage = JSON.parse(
    (await newAsyncStorage.getItem('SessionStore')) || '{}'
  ).user

  if (!userInMMKVStorage && !userInNewAsyncStorage && !userInOldAsyncStorage) {
    return
  }

  async function moveStorage(from: AsyncStorage) {
    const allOldKeys = await from.getAllKeys()
    await Promise.all(
      allOldKeys.map(async (key) => {
        const oldItem = (await from.getItem(key)) as string
        return await mmkvStorage.setItem(key, oldItem)
      })
    )
  }

  if (userInNewAsyncStorage) {
    await moveStorage(newAsyncStorage)
  } else if (userInOldAsyncStorage) {
    await moveStorage(oldAsyncStorage)
  }

  ReactNativeRestart.Restart()
}
