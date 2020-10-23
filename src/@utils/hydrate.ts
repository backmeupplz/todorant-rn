import { create } from 'mobx-persist'
import AsyncStorage from '@react-native-async-storage/async-storage'

export const hydrate = create({
  storage: AsyncStorage,
})
