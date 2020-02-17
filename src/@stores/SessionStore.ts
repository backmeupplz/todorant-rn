import { sockets } from './../@utils/sockets'
import { User } from '@models/User'
import { create, persist } from 'mobx-persist'
import { AsyncStorage } from 'react-native'
import { observable } from 'mobx'

const hydrate = create({
  storage: AsyncStorage,
})

class SessionStore {
  @persist('object', User) @observable user?: User

  login(user: User) {
    this.user = user
    sockets.authorize()
  }

  logout() {
    this.user = undefined
    sockets.logout()
  }
}

export const sharedSessionStore = new SessionStore()
hydrate('SessionStore', sharedSessionStore)
