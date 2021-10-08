import { observable, makeObservable } from 'mobx'
import SocketIO from 'socket.io-client'
import NetInfo from '@react-native-community/netinfo'
import { sharedSync } from '@sync/Sync'
import { sharedSessionStore } from '@stores/SessionStore'
import { migrateRealmToWMDB } from '@utils/realm'
import { alertError } from '@utils/alert'
import { sharedDelegationStore } from '@stores/DelegationStore'

const authorizationTimeout = 20

export class SocketConnection {
  token?: string
  encryptionKey?: string
  @observable authorized = false
  @observable connected = false
  @observable connectionError?: string = undefined

  socketIO = SocketIO(
    __DEV__ ? 'http://localhost:3000' : 'https://ws.todorant.com'
  )

  private pendingAuthorization?: {
    res: () => void
    rej: (reason: string) => void
    createdAt: number
  }

  constructor() {
    makeObservable(this)

    this.connect()
    this.createSocketListeners()
    this.startAuthorizationTimeoutChecker()
    this.startReconnectionChecker()
    this.createNetworkListener()
  }

  authorize = () => {
    return new Promise<void>((res, rej) => {
      if (!this.token) {
        return rej('Socket authorization: no authorization token provided')
      }
      if (!this.socketIO.connected) {
        return rej('Socket authorization: not connected to sockets')
      }
      if (this.authorized) {
        return res()
      }
      this.pendingAuthorization = { res, rej, createdAt: Date.now() }
      this.socketIO.emit('authorize', this.token, '2')
    })
  }

  logout = () => {
    this.token = undefined
    this.authorized = false
    if (this.socketIO.connected) {
      this.socketIO.emit('logout')
    }
  }

  private createSocketListeners() {
    this.socketIO.on('connect', this.onConnect)
    this.socketIO.on('disconnect', this.onDisconnect)

    this.socketIO.on('connect_error', this.onConnectError)
    this.socketIO.on('connect_timeout', this.onConnectTimeout)
    this.socketIO.on('error', this.onError)

    this.socketIO.on('authorized', this.onAuthorized)
  }

  private startAuthorizationTimeoutChecker() {
    setInterval(() => {
      if (!this.pendingAuthorization) {
        return
      }
      if (
        Date.now() - this.pendingAuthorization.createdAt >
        authorizationTimeout * 1000
      ) {
        this.pendingAuthorization.rej(
          'Socket authorization: operation timed out'
        )
        this.pendingAuthorization = undefined
      }
    }, 1000)
  }

  private startReconnectionChecker() {
    setInterval(() => {
      this.connect()
    }, 1000)
  }

  private createNetworkListener() {
    NetInfo.addEventListener((state) => {
      if (state.isInternetReachable) {
        this.connect()
      }
    })
  }

  private connect = () => {
    if (this.socketIO.connected) {
      return
    }
    try {
      this.socketIO.connect()
    } catch (err) {
      console.warn('Socket connection error', err)
    }
  }

  private onConnect = async () => {
    this.connected = true
    this.connectionError = undefined
    await this.authorize()
    await sharedSync.sync()
  }

  private onDisconnect = () => {
    this.connected = false
    this.authorized = false
    this.connect()
  }

  private onConnectError = (error: Error) => {
    this.connectionError = error.message
  }

  private onConnectTimeout = () => {
    console.warn('ws connect timeout')
  }

  private onError = (err: any) => {
    console.warn('ws error', err)
  }

  private onAuthorized = async () => {
    this.authorized = true
    this.pendingAuthorization?.res()
    this.pendingAuthorization = undefined
    if (!sharedSessionStore.migrationCompleted) {
      sharedSessionStore.migrationCompleted = true
    }
  }
}
