import { hydrateStore } from '@utils/hydrated'
import { sharedTodoStore } from '@stores/TodoStore'
import { sockets } from '@utils/sockets'
import { User, areUsersPartiallyEqual } from '@models/User'
import { persist } from 'mobx-persist'
import { observable, computed } from 'mobx'
import { hydrate } from '@utils/hydrate'
import { sharedSettingsStore } from './SettingsStore'
import { setToken, removeToken } from '@utils/keychain'

class SessionStore {
  @persist('date') @observable appInstalled = new Date()
  @persist('object', User) @observable user?: User

  @computed get appInstalledMonthAgo() {
    const monthAgo = new Date()
    monthAgo.setMonth(monthAgo.getMonth() - 1)
    return !this.appInstalled || this.appInstalled < monthAgo
  }

  hydrated = false

  login(user: User) {
    this.user = user
    sockets.authorize()
    setToken(user.token)
  }

  logout() {
    this.user = undefined
    sharedTodoStore.logout()
    sharedSettingsStore.logout()
    sockets.logout()
    removeToken()
  }

  onObjectsFromServer = async (
    user: User,
    pushBack: (objects: User) => Promise<User>
  ) => {
    if (!this.hydrated) {
      return
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
