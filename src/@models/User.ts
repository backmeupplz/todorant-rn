import { persist } from 'mobx-persist'
import { makeObservable, observable } from 'mobx'

class Settings {
  @persist showTodayOnAddTodo?: boolean
  @persist firstDayOfWeek?: number
  @persist newTodosGoFirst?: boolean
  @persist preserveOrderByTime?: boolean
}

enum TelegramLanguage {
  en = 'en',
  ru = 'ru',
}

export enum SubscriptionStatus {
  earlyAdopter = 'earlyAdopter',
  active = 'active',
  trial = 'trial',
  inactive = 'inactive',
}

export class User {
  constructor() {
    makeObservable(this)
  }

  @persist('date') @observable createdAt!: Date
  @persist('date') @observable updatedAt?: Date

  @persist @observable email?: string
  @persist @observable facebookId?: string
  @persist @observable telegramId?: string
  @persist @observable appleSubId?: string
  @persist @observable name!: string
  @persist('object', Settings) @observable settings!: Settings

  @persist @observable token!: string

  @persist @observable timezone!: number
  @persist @observable telegramZen!: boolean
  @persist @observable telegramLanguage?: TelegramLanguage

  @persist @observable subscriptionStatus!: SubscriptionStatus
  @persist @observable subscriptionId?: string
  @persist @observable appleReceipt?: string
  @persist @observable googleReceipt?: string

  @persist @observable createdOnApple?: boolean

  @persist @observable delegateInviteToken?: string
}

export function areUsersPartiallyEqual(user: User, anotherUser: User) {
  return (
    user.email === anotherUser.email &&
    user.facebookId === anotherUser.facebookId &&
    user.telegramId === anotherUser.telegramId &&
    user.name === anotherUser.name &&
    user.timezone === anotherUser.timezone &&
    user.subscriptionStatus === anotherUser.subscriptionStatus &&
    user.subscriptionId === anotherUser.subscriptionId
  )
}
