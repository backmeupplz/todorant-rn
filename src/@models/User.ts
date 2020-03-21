import { translate } from '@utils/i18n'
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
      return () => translate('earlyAdopter')
    case SubscriptionStatus.active:
      return () => translate('active')
    case SubscriptionStatus.trial:
      if (sharedSessionStore.user?.isTrialOver) {
        return () => translate('inactive')
      } else {
        return () => translate('trial')
      }
    case SubscriptionStatus.inactive:
      return () => translate('inactive')
    default:
      return () => ''
  }
}

export class User {
  @persist('date') @observable createdAt!: Date
  @persist('date') @observable updatedAt!: Date

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

  @computed get isSubscriptionActive() {
    return (
      this.subscriptionStatus === SubscriptionStatus.earlyAdopter ||
      this.subscriptionStatus === SubscriptionStatus.active ||
      (this.subscriptionStatus === SubscriptionStatus.trial &&
        !this.isTrialOver)
    )
  }

  @computed get isTrialOver() {
    return this.daysLeftOfTrial < 0
  }

  @computed get daysLeftOfTrial() {
    return 30 - daysBetween(this.createdAt, new Date())
  }

  @computed get hasPurchased() {
    return !!this.subscriptionId || !!this.appleSubId || !!this.googleReceipt
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
