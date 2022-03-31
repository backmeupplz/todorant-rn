import * as React from 'react'
import { DelegationUserType } from '@models/DelegationUser'
import { MelonTag } from '@models/MelonTag'
import { MelonTodo } from '@models/MelonTodo'
import { NavigationContainerRef } from '@react-navigation/native'
import { OnboardingSreens } from '@stores/OnboardingStore/Screen'
import { User } from '@models/User'

type DelegationsScreen = { delegationType: DelegationUserType }

export type RootStackParamList = {
  AddTodo: undefined | {}
  Planning: undefined
  HeroProfile: undefined
  EditTodo: undefined
  GoogleCalendar: undefined
  Tags: undefined
  ChangeText: { tag: MelonTag }
  AddEpic: { tag: MelonTag }
  ColorPicker: { tag: MelonTag }
  Paywall: undefined
  Privacy: undefined
  Terms: undefined
  Sockets: undefined
  Data: undefined
  Rules: undefined
  Login: undefined
  LoginQR: { getToken: (token: string) => void }
  Security: undefined
  LoginTelegram: { setLoadingToTrue: (user: User) => void }
  LoginFacebook: { setLoadingToTrue: (user: User) => void }
  Integrations: undefined
  BreakdownTodo: { todo: MelonTodo }
  Delegates: DelegationsScreen
  Delegators: DelegationsScreen
}

export const navigationRef =
  React.createRef<NavigationContainerRef<RootStackParamList>>()

export function navigate(name: keyof RootStackParamList, params?: object) {
  navigationRef.current?.navigate(name, params)
}

export function goBack() {
  navigationRef.current?.goBack()
}
