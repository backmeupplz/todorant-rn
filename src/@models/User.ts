import { persist } from 'mobx-persist'
import { sharedSessionStore } from '@stores/SessionStore'
import { daysBetween } from '@utils/daysBetween'
import { computed, observable } from 'mobx'

class Settings {
  @persist showTodayOnAddTodo?: boolean
  @persist firstDayOfWeek?: number
  @persist newTodosGoFirst?: boolean
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

export function subscriptionStatusName(
  subscriptionStatus?: SubscriptionStatus
) {
  switch (subscriptionStatus) {
    case SubscriptionStatus.earlyAdopter:
      return 'Early adopter 🦄'
    case SubscriptionStatus.active:
      return 'Active'
    case SubscriptionStatus.trial:
      if (sharedSessionStore.user?.isTrialOver) {
        return 'Inactive'
      } else {
        return 'Trial'
      }
    case SubscriptionStatus.inactive:
      return 'Inactive'
    default:
      return ''
  }
}

export class User {
  @persist('date') @observable createdAt: Date
  @persist('date') @observable updatedAt: Date

  @persist @observable email?: string
  @persist @observable facebookId?: string
  @persist @observable telegramId?: string
  @persist @observable appleSubId?: string
  @persist @observable name: string
  @persist('object', Settings) @observable settings: Settings

  @persist @observable token: string

  @persist @observable timezone: number
  @persist @observable telegramZen: boolean
  @persist @observable telegramLanguage?: TelegramLanguage

  @persist @observable subscriptionStatus: SubscriptionStatus
  @persist @observable subscriptionId?: string
  @persist @observable appleReceipt?: string

  @computed get isSubscriptionActive() {
    return (
      this.subscriptionStatus === SubscriptionStatus.earlyAdopter ||
      this.subscriptionStatus === SubscriptionStatus.active ||
      (this.subscriptionStatus === SubscriptionStatus.trial &&
        !this.isTrialOver)
    )
  }

  @computed get isTrialOver() {
    console.log(this.daysLeftOfTrial)
    return this.daysLeftOfTrial < 0
  }

  @computed get daysLeftOfTrial() {
    return 30 - daysBetween(this.createdAt, new Date())
  }

  constructor(
    createdAt: Date,
    updatedAt: Date,
    name: string,
    settings: Settings,
    token: string,
    timezone: number,
    telegramZen: boolean,
    subscriptionStatus: SubscriptionStatus,
    email?: string,
    facebookId?: string,
    telegramId?: string,
    appleSubId?: string,
    telegramLanguage?: TelegramLanguage,
    subscriptionId?: string,
    appleReceipt?: string
  ) {
    this.createdAt = createdAt
    this.updatedAt = updatedAt

    this.email = email
    this.facebookId = facebookId
    this.telegramId = telegramId
    this.appleSubId = appleSubId
    this.name = name
    this.settings = settings
    this.token = token
    this.timezone = timezone
    this.telegramZen = telegramZen
    this.telegramLanguage = telegramLanguage
    this.subscriptionStatus = subscriptionStatus
    this.subscriptionId = subscriptionId
    this.appleReceipt = appleReceipt
  }
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
