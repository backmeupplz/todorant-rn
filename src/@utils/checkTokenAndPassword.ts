import {
  setToken,
  removeToken,
  setPassword,
  removePassword,
} from '@utils/keychain'
import { sharedSessionStore } from '@stores/SessionStore'

export function checkTokenAndPassword() {
  // Token
  const token = sharedSessionStore.user?.token
  if (token) {
    setToken(token)
  } else {
    removeToken()
  }
  // Password
  const password = sharedSessionStore.encryptionKey
  if (password) {
    setPassword(password)
  } else {
    removePassword()
  }
}
