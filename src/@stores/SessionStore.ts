import { AsyncStorage } from 'react-native'
import {
  ObservableNowEventEmitterEvent,
  observableNowEventEmitter,
} from '@utils/ObservableNow'
import { User, areUsersPartiallyEqual } from '@models/User'
import { computed, makeObservable, observable } from 'mobx'
import { database } from '@utils/watermelondb/wmdb'
import { hydrate } from '@stores/hydration/hydrate'
import { hydrateStore } from '@stores/hydration/hydrateStore'
import { logEvent } from '@utils/logEvent'
import { persist } from 'mobx-persist'
import { removePassword, removeToken, setToken } from '@utils/keychain'
import { resetDelegateToken } from '@utils/rest'
import { sharedDelegationStore } from '@stores/DelegationStore'
import { sharedHeroStore } from '@stores/HeroStore'
import { sharedSettingsStore } from '@stores/SettingsStore'
import { sharedSync } from '@sync/Sync'
import { sharedTodoStore } from '@stores/TodoStore'
import { v4 } from 'uuid'

class SessionStore {
  constructor() {
    makeObservable(this)
  }

  @persist('date') @observable appInstalled = new Date()
  @persist @observable installationId = v4()
  @persist('object', User) @observable user?: User
  @persist @observable localAppleReceipt?: string

  @persist @observable encryptionKey?: string

  @persist @observable numberOfTodosCompleted = 0
  @persist @observable askedToRate = false

  // Temporary variables. Should me removed after deleting realmdb.
  @persist @observable migrationCompleted = false
  @persist @observable localMigrationCompleted = false
  // Temporary variable. Should be removed after releasing beta-version as main version.
  @persist @observable exactDatesRecalculated = false

  @observable loggingOut = false
  @observable isInitialSync = false

  @computed get needsToRequestRate() {
    return !this.askedToRate && this.numberOfTodosCompleted > 101
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
    this.isInitialSync = false
    sharedTodoStore.initDelegation()
    logEvent('login_success')
  }

  async logout() {
    this.loggingOut = true
    try {
      this.user = undefined
      this.encryptionKey = undefined
      observableNowEventEmitter.emit(ObservableNowEventEmitterEvent.Logout)
      await database.write(async () => await database.unsafeResetDatabase())
      const newAsyncStorage = AsyncStorage
      const oldAsyncStorage =
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        require('@react-native-async-storage/async-storage')
          .default as typeof AsyncStorage
      await newAsyncStorage.clear()
      await oldAsyncStorage.clear()
      sharedSync.logout()
      sharedSettingsStore.logout()
      sharedTodoStore.logout()
      sharedDelegationStore.logout()
      sharedHeroStore.logout()
      sharedDelegationStore.logout()
      sharedTodoStore.oldTodosCount = 0
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
    if (this.user && !this.user.delegateInviteToken && this.user.token) {
      this.user.delegateInviteToken = await resetDelegateToken(this.user.token)
    }
  }
}

export const sharedSessionStore = new SessionStore()
hydrate('SessionStore', sharedSessionStore).then(async () => {
  sharedSessionStore.hydrated = true
  hydrateStore('SessionStore')
  if (sharedSessionStore.user?.token) {
    sharedSync.login(sharedSessionStore.user.token)
    setToken(sharedSessionStore.user.token)
  } else {
    removeToken()
  }
})
