import { sharedSocketStore } from './../@stores/SocketStore'
import SocketIO from 'socket.io-client'
import { sharedSessionStore } from '@stores/SessionStore'

const socketIO = SocketIO('http://localhost:3000')

class SocketManager {
  constructor() {
    this.connect()

    socketIO.on('connect', this.onConnect)
    socketIO.on('disconnect', this.onDisconnect)

    socketIO.on('connect_error', this.onConnectError)
    socketIO.on('connect_timeout', this.onConnectTimeout)
    socketIO.on('error', this.onError)

    socketIO.on('authorized', this.onAuthorized)
  }

  connect = () => {
    if (socketIO.connected) {
      return
    }
    socketIO.connect()
  }
  authorize = () => {
    if (!sharedSessionStore.user?.token || !socketIO.connected) {
      return
    }
    socketIO.emit('authorize', sharedSessionStore.user.token)
  }
  logout = () => {
    if (!socketIO.connected) {
      return
    }
    socketIO.emit('logout')
    sharedSocketStore.authorized = false
  }

  onConnect = () => {
    sharedSocketStore.connected = true
    sharedSocketStore.connectionError = undefined
    this.authorize()
  }
  onDisconnect = () => {
    sharedSocketStore.connected = false
    sharedSocketStore.authorized = false
  }

  onConnectError = (error: Error) => {
    sharedSocketStore.connectionError = error
  }
  onConnectTimeout = () => {
    console.warn('ws connect timeout')
  }
  onError = () => {
    console.warn('ws error')
  }

  onAuthorized = () => {
    sharedSocketStore.authorized = true
  }
}

export const sockets = new SocketManager()
