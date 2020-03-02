import { Settings } from './../@models/Settings'
import { create, persist } from 'mobx-persist'
import { AsyncStorage } from 'react-native'
import { observable } from 'mobx'

const hydrate = create({
  storage: AsyncStorage,
})

class SettingsStore {
  @persist('date' as any) @observable lastSyncDate?: Date

  @persist showTodayOnAddTodo?: boolean
  @persist firstDayOfWeek?: number
  @persist newTodosGoFirst?: boolean

  onSettings = async (settings: Settings) => {
    console.warn(settings)
  }
}

export const sharedSettingsStore = new SettingsStore()
hydrate('SettingsStore', sharedSettingsStore)
