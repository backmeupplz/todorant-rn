import { makeObservable, observable } from 'mobx'

class SocketStore {
  constructor() {
    makeObservable(this)
  }

  @observable connected = false
  @observable authorized = false
  @observable connectionError?: Error
}

export const sharedSocketStore = new SocketStore()
