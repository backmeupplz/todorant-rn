import { sharedSessionStore } from '@stores/SessionStore'
import { AES, enc } from 'crypto-js'

export function encrypt(str: string) {
  if (!sharedSessionStore.encryptionKey) {
    return str
  } else {
    return _e(str, sharedSessionStore.encryptionKey)
  }
}

export function decrypt(str: string) {
  if (!sharedSessionStore.encryptionKey) {
    return str
  } else {
    return _d(str, sharedSessionStore.encryptionKey)
  }
}

export function _e(value: string, key: string) {
  return AES.encrypt(value, key).toString()
}

export function _d(value: string, key: string) {
  const bytes = AES.decrypt(value, key)
  return bytes.toString(enc.Utf8)
}
