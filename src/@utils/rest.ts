import { Platform } from 'react-native'
import { User } from '@models/User'
import axios from 'axios'

const base = __DEV__
  ? Platform.OS === 'android'
    ? 'http://10.0.2.2:1337'
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
