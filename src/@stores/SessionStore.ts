import { sharedSync } from '@sync/Sync'
import { areUsersPartiallyEqual, SubscriptionStatus, User } from '@models/User'
import { daysBetween } from '@utils/daysBetween'
import { hydrate } from '@stores/hydration/hydrate'
import { hydrateStore } from '@stores/hydration/hydrateStore'
import { removePassword, removeToken, setToken } from '@utils/keychain'
import { logEvent } from '@utils/logEvent'
import { realm } from '@utils/realm'
import { computed, makeObservable, observable } from 'mobx'
import { persist } from 'mobx-persist'
import { sharedSettingsStore } from './SettingsStore'
import { sharedTodoStore } from './TodoStore'
import { sharedDelegationStore } from './DelegationStore'
import { sharedHeroStore } from './HeroStore'
import AsyncStorage from '@react-native-community/async-storage'
import {
  observableNowEventEmitter,
  ObservableNowEventEmitterEvent,
} from '@utils/ObservableNow'
import uuid from 'uuid'
import { resetDelegateToken } from '@utils/rest'
import { database, todosCollection } from '@utils/wmdb'

class SessionStore {
  constructor() {
    makeObservable(this)
  }

  @persist('date') @observable appInstalled = new Date()
  @persist @observable installationId = uuid()
  @persist('object', User) @observable user?: User
  @persist @observable localAppleReceipt?: string

  @persist @observable encryptionKey?: string

  @persist @observable numberOfTodosCompleted = 0
  @persist @observable askedToRate = false

  @observable loggingOut = false
  @observable isInitialSync = false

  @computed get needsToRequestRate() {
    return !this.askedToRate && this.numberOfTodosCompleted > 101
  }

  @computed get appInstalledMonthAgo() {
    const monthAgo = new Date()
    monthAgo.setMonth(monthAgo.getMonth() - 1)
    return !this.appInstalled || this.appInstalled < monthAgo
  }

  @computed get shouldShowPaywalSubscription() {
    return !(
      (this.user?.subscriptionStatus === SubscriptionStatus.earlyAdopter &&
        this.hasPurchased) ||
      this.user?.subscriptionStatus == SubscriptionStatus.active
    )
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
    return `https://todorant.com/invite/${this.user?.delegateInviteToken}`
  }

  hydrated = false

  async login(user: User) {
    this.user = user
    this.isInitialSync = true
    await sharedSync.login(user.token)
    setToken(user.token)
    try {
      await sharedSync.globalSync()
    } finally {
      this.isInitialSync = false
    }
    logEvent('login_success')
  }

  async logout() {
    this.loggingOut = true
    try {
      this.user = undefined
      this.encryptionKey = undefined
      observableNowEventEmitter.emit(ObservableNowEventEmitterEvent.Logout)
      await database.unsafeResetDatabase()
      observableNowEventEmitter.emit(
        ObservableNowEventEmitterEvent.ObservableNowChanged
      )
      await AsyncStorage.clear()
      sharedSync.logout()
      sharedSettingsStore.logout()
      sharedTodoStore.logout()
      sharedDelegationStore.logout()
      sharedHeroStore.logout()
      sharedDelegationStore.logout()
      removeToken()
      removePassword()
      logEvent('logout_success')
    } finally {
      this.loggingOut = false
    }
  }

  onObjectsFromServer = async (
    user: User,
    pushBack: (objects: User) => Promise<User>,
    completeSync: () => void
  ) => {
    if (!this.hydrated) {
      throw new Error("Store didn't hydrate yet")
    }
    if (user.updatedAt) {
      user.updatedAt = new Date(user.updatedAt)
    }
    user.createdAt = new Date(user.createdAt)
    if (
      !this.user ||
      !this.user.updatedAt ||
      !user.updatedAt ||
      this.user.updatedAt < user.updatedAt
    ) {
      const token = this.user?.token
      this.user = user
      if (token) {
        this.user.token = token
      }
    } else {
      // Update the current user id
      this.user._id = user._id
      if (!areUsersPartiallyEqual(this.user, user)) {
        const userFromServer = await pushBack(this.user)
        if (userFromServer.updatedAt) {
          userFromServer.updatedAt = new Date(userFromServer.updatedAt)
        }
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
    if (this.user && !this.user.delegateInviteToken) {
      this.user.delegateInviteToken = await resetDelegateToken()
    }
  }
}

export const sharedSessionStore = new SessionStore()
hydrate('SessionStore', sharedSessionStore).then(() => {
  sharedSessionStore.hydrated = true
  hydrateStore('SessionStore')
  if (sharedSessionStore.user?.token) {
    sharedSync.login(sharedSessionStore.user.token)
    setToken(sharedSessionStore.user.token)
  } else {
    removeToken()
  }
})
