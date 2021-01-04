import { areUsersPartiallyEqual, SubscriptionStatus, User } from '@models/User'
import { daysBetween } from '@utils/daysBetween'
import { hydrate } from '@utils/hydration/hydrate'
import { hydrateStore } from '@utils/hydration/hydrateStore'
import { removePassword, removeToken, setToken } from '@utils/keychain'
import { logEvent } from '@utils/logEvent'
import { realm } from '@utils/realm'
import { sockets } from '@utils/sockets'
import { computed, observable } from 'mobx'
import { persist } from 'mobx-persist'

class SessionStore {
  @persist('date') @observable appInstalled = new Date()
  @persist('object', User) @observable user?: User
  @persist @observable localAppleReceipt?: string

  @persist @observable introMessageShown = __DEV__ ? true : false

  @persist @observable encryptionKey?: string

  @persist @observable numberOfTodosCompleted = 0
  @persist @observable askedToRate = false
  @computed get needsToRequestRate() {
    return !this.askedToRate && this.numberOfTodosCompleted > 101
  }

  @computed get appInstalledMonthAgo() {
    const monthAgo = new Date()
    monthAgo.setMonth(monthAgo.getMonth() - 1)
    return !this.appInstalled || this.appInstalled < monthAgo
  }

  @computed get isSubscriptionActive() {
    return (
      this.user?.subscriptionStatus === SubscriptionStatus.earlyAdopter ||
      this.user?.subscriptionStatus === SubscriptionStatus.active ||
      (this.user?.subscriptionStatus === SubscriptionStatus.trial &&
        !this.user?.createdOnApple &&
        !this.isTrialOver)
    )
  }

  @computed get isTrialOver() {
    return this.daysLeftOfTrial < 0
  }

  @computed get daysLeftOfTrial() {
    return 30 - daysBetween(this.user?.createdAt || new Date(), new Date())
  }

  @computed get hasPurchased() {
    return (
      !!this.user?.subscriptionId ||
      !!this.user?.appleReceipt ||
      !!this.user?.googleReceipt
    )
  }

  @computed get delegateInviteLink() {
    return `https://todorant.com/invite/${this.user!.delegateInviteToken}`
  }

  hydrated = false

  async login(user: User) {
    this.user = user
    await sockets.authorize()
    setToken(user.token)
    await sockets.globalSync()
    logEvent('login_success')
  }

  logout() {
    this.user = undefined
    this.encryptionKey = undefined
    realm.write(() => {
      realm.deleteAll()
    })
    sockets.logout()
    removeToken()
    removePassword()
    logEvent('logout_success')
  }

  onObjectsFromServer = async (
    user: User,
    pushBack: (objects: User) => Promise<User>,
    completeSync: () => void
  ) => {
    if (!this.hydrated) {
      throw new Error("Store didn't hydrate yet")
    }
    user.updatedAt = new Date(user.updatedAt)
    user.createdAt = new Date(user.createdAt)
    if (!this.user || this.user.updatedAt < user.updatedAt) {
      const token = this.user?.token
      this.user = user
      if (token) {
        this.user.token = token
      }
    } else {
      if (!areUsersPartiallyEqual(this.user, user)) {
        const userFromServer = await pushBack(this.user)

        userFromServer.updatedAt = new Date(userFromServer.updatedAt)
        userFromServer.createdAt = new Date(userFromServer.createdAt)
        Object.assign(this.user, {
          subscriptionId: undefined,
          appleReceipt: undefined,
          appleSubId: undefined,
          ...userFromServer,
        })
      } else {
        this.user.updatedAt = user.updatedAt
      }
    }
    completeSync()
  }
}

export const sharedSessionStore = new SessionStore()
hydrate('SessionStore', sharedSessionStore).then(() => {
  sharedSessionStore.hydrated = true
  sockets.authorize()
  hydrateStore('SessionStore')
  if (sharedSessionStore.user?.token) {
    setToken(sharedSessionStore.user.token)
  } else {
    removeToken()
  }
})
