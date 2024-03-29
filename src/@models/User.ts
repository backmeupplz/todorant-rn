import { makeObservable, observable } from 'mobx'
import { persist } from 'mobx-persist'

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

export class User {
  constructor() {
    makeObservable(this)
  }

  @persist('date') @observable createdAt!: Date
  @persist('date') @observable updatedAt?: Date

  @persist @observable _id?: string
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

  @persist @observable delegateInviteToken?: string
}

export function areUsersPartiallyEqual(user: User, anotherUser: User) {
  return (
    user._id === anotherUser._id &&
    user.email === anotherUser.email &&
    user.facebookId === anotherUser.facebookId &&
    user.telegramId === anotherUser.telegramId &&
    user.name === anotherUser.name &&
    user.timezone === anotherUser.timezone
  )
}
