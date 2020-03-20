import { Platform } from 'react-native'
import { User } from '@models/User'
import axios from 'axios'
import { sharedSessionStore } from '@stores/SessionStore'

const base = __DEV__
  ? Platform.OS === 'android'
    ? 'http://192.168.31.27:1337'
    : 'http://localhost:1337'
  : 'https://backend.todorant.com'

export function loginGoogle(accessToken: string) {
  return axios.post<User>(`${base}/login/google`, {
    accessToken,
  })
}

export function loginFacebook(accessToken: string) {
  return axios.post<User>(`${base}/login/facebook`, {
    accessToken,
  })
}

export function verifyPurchaseGoogle(payload: {
  packageName: string
  productId: string
  purchaseToken: string
}) {
  return axios.post<void>(`${base}/google/subscription`, payload, {
    headers: {
      token: sharedSessionStore.user?.token,
    },
  })
}
