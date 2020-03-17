import { sharedTodoStore } from '@stores/TodoStore'
import { sockets } from '@utils/sockets'
import { User } from '@models/User'
import { persist } from 'mobx-persist'
import { observable } from 'mobx'
import { hydrate } from '@utils/hydrate'
import { sharedSettingsStore } from './SettingsStore'

class SessionStore {
  @persist('object', User) @observable user?: User

  login(user: User) {
    this.user = user
    sockets.authorize()
  }

  logout() {
    this.user = undefined
    sharedTodoStore.logout()
    sharedSettingsStore.logout()
    sockets.logout()
  }

  onObjectsFromServer = async (
    user: User,
    pushBack: (objects: User) => Promise<User>
  ) => {
    // user.updatedAt = new Date(user.updatedAt)
    // user.createdAt = new Date(user.createdAt)
    // if (!this.user || this.user.updatedAt < user.updatedAt) {
    //   this.user = user
    // } else {
    //   if ()
    //   const userFromServer = await pushBack(this.user)
    //   this.user = userFromServer
    // }
  }
}

export const sharedSessionStore = new SessionStore()
hydrate('SessionStore', sharedSessionStore).then(() => {
  sockets.authorize()
})
