import { NativeModules, Platform } from 'react-native'
import TodorantWidget from '@upacyxou/react-native-todorant-widget'
import SharedPreferences from 'react-native-shared-preferences'

const KeychainManager = NativeModules.KeychainManager
const WidgetManager = NativeModules.WidgetManager
const WatchUpdateManager = NativeModules.WatchUpdateManager

export function setToken(token: string) {
  if (Platform.OS === 'ios') {
    KeychainManager.setToken(token)
    WidgetManager.refresh()
    WatchUpdateManager.updateContext()
  } else {
    SharedPreferences.setItem('token', token)
    TodorantWidget.forceUpdateAll()
  }
}

export function removeToken() {
  if (Platform.OS === 'ios') {
    KeychainManager.removeToken()
    WidgetManager.refresh()
    WatchUpdateManager.updateContext()
  } else {
    SharedPreferences.removeItem('token')
    TodorantWidget.forceUpdateAll()
  }
}

export function setPassword(password: string) {
  if (Platform.OS === 'ios') {
    KeychainManager.setPassword(password)
    WidgetManager.refresh()
    WatchUpdateManager.updateContext()
  } else {
    SharedPreferences.setItem('password', password)
    TodorantWidget.forceUpdateAll()
  }
}

export function removePassword() {
  if (Platform.OS === 'ios') {
    KeychainManager.removePassword()
    WidgetManager.refresh()
    WatchUpdateManager.updateContext()
  } else {
    SharedPreferences.removeItem('password')
    TodorantWidget.forceUpdateAll()
  }
}
