import { GoogleCalendarCredentials } from '@models/GoogleCalendarCredentials'
import { Platform } from 'react-native'
import { User } from '@models/User'
import { sharedSessionStore } from '@stores/SessionStore'
import axios, { AxiosResponse } from 'axios'

const base = __DEV__ ? 'http://localhost:1337' : 'https://backend.todorant.com'

const extraParams = () =>
  Platform.OS === 'ios'
    ? {
        fromApple: true,
        appleReceipt: sharedSessionStore.localAppleReceipt,
      }
    : {}

function cleanLocalAppleReceipt(user: AxiosResponse<User>) {
  sharedSessionStore.localAppleReceipt = undefined
  return user
}

export function loginGoogle(accessToken: string) {
  return axios
    .post<User>(`${base}/login/google`, {
      accessToken,
      ...extraParams(),
    })
    .then(cleanLocalAppleReceipt)
}

export function loginApple(code: string, user?: any) {
  return axios
    .post<User>(`${base}/login/apple`, {
      client: 'ios',
      code,
      user,
      ...extraParams(),
    })
    .then(cleanLocalAppleReceipt)
}

export function loginAppleAndroid(code: string, name?: string) {
  return axios
    .post<User>(`${base}/login/apple-firebase`, {
      client: 'android',
      credential: {
        oauthIdToken: code,
      },
      name,
      ...extraParams(),
    })
    .then(cleanLocalAppleReceipt)
}

export function loginToken(token: string) {
  return axios
    .post<User>(`${base}/login/token`, {
      token,
      ...extraParams(),
    })
    .then(cleanLocalAppleReceipt)
}

export async function setQrToken(uuid: string, token: string) {
  return (
    await axios.post(
      `${base}/login/qr_token`,
      {
        uuid,
        ...extraParams(),
      },
      { headers: { token } }
    )
  ).data as string
}

export function sendFeedback(state: object, token: string) {
  return axios.post<void>(
    `${base}/feedback`,
    { state },
    {
      headers: {
        token,
      },
    }
  )
}

export function sendData(data: any, token: string) {
  return axios.post<void>(
    `${base}/data`,
    { data },
    {
      headers: {
        token,
      },
    }
  )
}

export function calendarAuthenticationURL(token: string) {
  return axios.get<string>(`${base}/google/calendarAuthenticationURL`, {
    headers: {
      token,
    },
  })
}

export function calendarAuthorize(code: string, token: string) {
  return axios.post<GoogleCalendarCredentials>(
    `${base}/google/calendarAuthorize`,
    { code },
    {
      headers: {
        token,
      },
    }
  )
}

export async function setUserName(name: string, token: string) {
  return axios.post(
    `${base}/settings/username`,
    { name: name },
    {
      headers: {
        token,
      },
    }
  )
}

export async function resetDelegateToken(token: string) {
  return (
    await axios.post(
      `${base}/delegate/generateToken`,
      {},
      {
        headers: {
          token,
        },
      }
    )
  ).data as string
}
