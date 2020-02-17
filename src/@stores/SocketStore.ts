import { observable } from 'mobx'

class SocketStore {
  @observable connected = false
  @observable authorized = false
  @observable connectionError?: Error
}

export const sharedSocketStore = new SocketStore()
