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
}

export const sharedSessionStore = new SessionStore()
hydrate('SessionStore', sharedSessionStore).then(() => {
  sockets.authorize()
})
