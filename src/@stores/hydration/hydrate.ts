import { create } from 'mobx-persist'
import MMKVStorage from 'react-native-mmkv-storage'
export const MMKV = new MMKVStorage.Loader().initialize() // Returns an MMKV Instance

export const hydrate = create({
  storage: MMKV,
})
