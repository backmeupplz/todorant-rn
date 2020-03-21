import { NativeModules, Platform } from 'react-native'

const KeychainManager = NativeModules.KeychainManager

export function setToken(token: string) {
  if (Platform.OS === 'ios') {
    KeychainManager.setToken(token)
  }
}

export function removeToken() {
  if (Platform.OS === 'ios') {
    KeychainManager.removeToken()
  }
}
