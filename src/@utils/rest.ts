import { GoogleCalendarCredentials } from '@models/GoogleCalendarCredentials'
import { User } from '@models/User'
import axios, { AxiosResponse } from 'axios'
import { sharedSessionStore } from '@stores/SessionStore'
import { Platform } from 'react-native'

const base = __DEV__
  ? 'http://192.168.31.26:1337'
  : 'https://backend.todorant.com'

const extraParams =
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
      ...extraParams,
    })
    .then(cleanLocalAppleReceipt)
}

export function loginFacebook(accessToken: string) {
  return axios
    .post<User>(`${base}/login/facebook`, {
      accessToken,
      ...extraParams,
    })
    .then(cleanLocalAppleReceipt)
}

export function loginApple(code: string, user?: any) {
  return axios
    .post<User>(`${base}/login/apple`, {
      client: 'ios',
      code,
      user,
      ...extraParams,
    })
    .then(cleanLocalAppleReceipt)
}

export function loginToken(token: string) {
  return axios
    .post<User>(`${base}/login/token`, {
      token,
      ...extraParams,
    })
    .then(cleanLocalAppleReceipt)
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

export function verifyPurchaseApple(receipt: string) {
  return axios.post<void>(
    `${base}/apple/subscription`,
    { receipt },
    {
      headers: {
        token: sharedSessionStore.user?.token,
      },
    }
  )
}

export function sendFeedback(state: object) {
  return axios.post<void>(
    `${base}/feedback`,
    { state },
    {
      headers: {
        token: sharedSessionStore.user?.token,
      },
    }
  )
}

export function calendarAuthenticationURL() {
  return axios.get<string>(`${base}/google/calendarAuthenticationURL`, {
    headers: {
      token: sharedSessionStore.user?.token,
    },
  })
}

export function calendarAuthorize(code: string) {
  return axios.post<GoogleCalendarCredentials>(
    `${base}/google/calendarAuthorize`,
    { code },
    {
      headers: {
        token: sharedSessionStore.user?.token,
      },
    }
  )
}
