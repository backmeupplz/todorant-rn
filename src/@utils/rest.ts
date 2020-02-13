import { User } from '@models/User'
import axios from 'axios'

const base = 'https://backend.todorant.com'

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
