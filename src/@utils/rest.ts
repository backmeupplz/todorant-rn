import { User } from '@models/User'
import axios from 'axios'

const base = 'https://backend.todorant.com'

export function loginGoogle(accessToken: string) {
  return axios.post<User>(`${base}/login/google`, {
    accessToken,
  })
}
