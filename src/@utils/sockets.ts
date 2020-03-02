import { alertError } from '@utils/alert'
import { Todo } from '@models/Todo'
import { sharedTodoStore } from '@stores/TodoStore'
import { sharedSocketStore } from '@stores/SocketStore'
import SocketIO from 'socket.io-client'
import { sharedSessionStore } from '@stores/SessionStore'
import uuid from 'uuid'
import { Toast } from 'native-base'
import { sharedSettingsStore } from '@stores/SettingsStore'

const socketIO = SocketIO(
  __DEV__ ? 'http://10.0.2.2:3000' : 'https://ws.todorant.com'
)

type PromiseMap = { [index: string]: { res: Function; rej: Function } }

class SyncManager<T> {
  name: string
  pendingPushes: PromiseMap
  latestSyncDate: () => Date | undefined
  onObjectsFromServer: (
    objects: T,
    pushBack: (objects: T) => Promise<T>
  ) => Promise<void>

  // 0
  constructor(
    name: string,
    pendingPushes: PromiseMap,
    latestSyncDate: () => Date | undefined,
    onObjectsFromServer: (
      objects: T,
      pushBack: (objects: T) => Promise<T>
    ) => Promise<void>,
    setLastSyncDate: (latestSyncDate: Date) => void
  ) {
    this.name = name
    this.pendingPushes = pendingPushes
    this.latestSyncDate = latestSyncDate
    this.onObjectsFromServer = onObjectsFromServer

    // -1
    socketIO.on(`${name}_sync_request`, this.sync)

    // 2
    socketIO.on(name, async (response: T) => {
      console.warn(`${this.name}: onObjectsFromServer`, response)
      try {
        await onObjectsFromServer(response, this.pushObjects)
      } catch (err) {
        alertError(err)
      }
    })
    // 4
    socketIO.on(`${name}_pushed`, (pushId: string, objects: T) => {
      console.warn(`${this.name}: pushed`, pushId, objects)
      this.pendingPushes[pushId]?.res(objects)
      delete this.pendingPushes[pushId]
      setLastSyncDate(new Date())
    })
    // 4
    socketIO.on(`${name}_pushed_error`, (pushId: string, error: Error) => {
      console.warn(`${this.name}: pushed_error`, pushId, error)
      this.pendingPushes[pushId]?.rej(error)
      delete this.pendingPushes[pushId]
    })
  }

  // 1
  sync = async () => {
    if (!sharedSessionStore.user?.token || !socketIO.connected) {
      return
    }
    console.warn(`${this.name}: sync`, sharedTodoStore.lastSyncDate)
    socketIO.emit(`sync_${this.name}`, this.latestSyncDate())
  }

  // 3
  private pushObjects = (objects: T): Promise<T> => {
    return new Promise<T>((res, rej) => {
      const pushId = uuid()
      this.pendingPushes[pushId] = { res, rej }
      console.warn(`${this.name}: pushObjects`, pushId, objects)
      socketIO.emit(`push_${this.name}`, pushId, objects)
    })
  }
}

class SocketManager {
  pendingPushes = {} as PromiseMap

  todoSyncManager: SyncManager<Todo[]>

  constructor() {
    this.connect()

    socketIO.on('connect', this.onConnect)
    socketIO.on('disconnect', this.onDisconnect)

    socketIO.on('connect_error', this.onConnectError)
    socketIO.on('connect_timeout', this.onConnectTimeout)
    socketIO.on('error', this.onError)

    socketIO.on('authorized', this.onAuthorized)

    this.todoSyncManager = new SyncManager<Todo[]>(
      'todos',
      this.pendingPushes,
      () => sharedTodoStore.lastSyncDate,
      sharedTodoStore.onObjectsFromServer,
      lastSyncDate => {
        sharedTodoStore.lastSyncDate = lastSyncDate
      }
    )
  }

  connect = () => {
    if (socketIO.connected) {
      return
    }
    socketIO.connect()
  }
  authorize = () => {
    if (
      !sharedSessionStore.user?.token ||
      !socketIO.connected ||
      sharedSocketStore.authorized
    ) {
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
    this.globalSync()
  }

  globalSync = () => {
    this.todoSyncManager.sync()
  }
}

export const sockets = new SocketManager()
