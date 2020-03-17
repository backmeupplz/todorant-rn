import { persist } from 'mobx-persist'

class Settings {
  @persist showTodayOnAddTodo?: boolean
  @persist firstDayOfWeek?: number
  @persist newTodosGoFirst?: boolean
}

enum TelegramLanguage {
  en = 'en',
  ru = 'ru',
}

enum SubscriptionStatus {
  earlyAdopter = 'earlyAdopter',
  active = 'active',
  trial = 'trial',
  inactive = 'inactive',
}

export class User {
  @persist('date') createdAt: Date
  @persist('date') updatedAt: Date

  @persist email?: string
  @persist facebookId?: string
  @persist telegramId?: string
  @persist appleSubId?: string
  @persist name: string
  @persist('object', Settings) settings: Settings

  @persist token: string

  @persist timezone: number
  @persist telegramZen: boolean
  @persist telegramLanguage?: TelegramLanguage

  @persist subscriptionStatus: SubscriptionStatus
  @persist subscriptionId?: string
  @persist appleReceipt?: string

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

  isEqual(anotherUser: User) {
    return (
      this.createdAt === anotherUser.createdAt &&
      this.updatedAt === anotherUser.updatedAt &&
      this.email === anotherUser.email &&
      this.facebookId === anotherUser.facebookId &&
      this.telegramId === anotherUser.telegramId &&
      this.appleSubId === anotherUser.appleSubId &&
      this.name === anotherUser.name &&
      this.token === anotherUser.token &&
      this.timezone === anotherUser.timezone &&
      this.telegramZen === anotherUser.telegramZen &&
      this.telegramLanguage === anotherUser.telegramLanguage &&
      this.subscriptionStatus === anotherUser.subscriptionStatus &&
      this.subscriptionId === anotherUser.subscriptionId &&
      this.appleReceipt === anotherUser.appleReceipt
    )
  }
}
