import { create } from 'mobx-persist'
import { AsyncStorage } from 'react-native'
// RN 64.import MMKVStorage from 'react-native-mmkv-storage'
// RN 64.export const MMKV = new MMKVStorage.Loader().initialize() // Returns an MMKV Instance

export const hydrate = create({
  storage: AsyncStorage,
})
