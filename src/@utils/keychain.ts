import { NativeModules, Platform } from 'react-native'
import TodorantWidget from 'react-native-todorant-widget'
import SharedPreferences from 'react-native-shared-preferences'

const KeychainManager = NativeModules.KeychainManager

export function setToken(token: string) {
  if (Platform.OS === 'ios') {
    KeychainManager.setToken(token)
  } else {
    SharedPreferences.setItem('token', token)
    TodorantWidget.forceUpdateAll()
  }
}

export function removeToken() {
  if (Platform.OS === 'ios') {
    KeychainManager.removeToken()
  } else {
    SharedPreferences.removeItem('token')
    TodorantWidget.forceUpdateAll()
  }
}

export function setPassword(password: string) {
  if (Platform.OS === 'ios') {
  } else {
    SharedPreferences.setItem('password', password)
    TodorantWidget.forceUpdateAll()
  }
}

export function removePassword() {
  if (Platform.OS === 'ios') {
  } else {
    SharedPreferences.removeItem('password')
    TodorantWidget.forceUpdateAll()
  }
}
