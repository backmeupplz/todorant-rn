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
  }

  logout() {
    this.user = undefined
  }
}

export const sharedSessionStore = new SessionStore()
hydrate('SessionStore', sharedSessionStore)
