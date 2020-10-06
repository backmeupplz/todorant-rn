import { sharedHeroStore } from '@stores/HeroStore'
import { Hero } from '@models/Hero'
import { sharedTagStore } from '@stores/TagStore'
import { Tag } from '@models/Tag'
import { Settings } from '@models/Settings'
import { alertError } from '@utils/alert'
import { Todo } from '@models/Todo'
import { sharedTodoStore } from '@stores/TodoStore'
import { sharedSocketStore } from '@stores/SocketStore'
import SocketIO from 'socket.io-client'
import { sharedSessionStore } from '@stores/SessionStore'
import uuid from 'uuid'
import { sharedSettingsStore } from '@stores/SettingsStore'
import { isHydrated } from '@utils/hydrated'
import { User } from '@models/User'
import events from 'events'

const socketIO = SocketIO(
  'https://ws.todorant.com'
)

type PromiseMap = { [index: string]: { res: Function; rej: Function } }

export const syncEventEmitter = new events.EventEmitter()

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
    setLastSyncDate?: (latestSyncDate: Date) => void
  ) {
    this.name = name
    this.pendingPushes = pendingPushes
    this.latestSyncDate = latestSyncDate
    this.onObjectsFromServer = onObjectsFromServer

    // -1
    socketIO.on(`${name}_sync_request`, () => {
      console.warn(`${this.name}: sync_request`)
      this.sync()
    })

    // 2
    socketIO.on(name, async (response: T) => {
      console.warn(
        `${this.name}: onObjectsFromServer`,
        Array.isArray(response) ? response.length : 1
      )
      try {
        await onObjectsFromServer(response, this.pushObjects)
      } catch (err) {
        alertError(err)
        syncEventEmitter.emit(`${name}_sync_errored`, err)
      }
    })
    // 4
    socketIO.on(`${name}_pushed`, (pushId: string, objects: T) => {
      console.warn(
        `${this.name}: pushed`,
        Array.isArray(objects) ? objects.length : 1
      )
      this.pendingPushes[pushId]?.res(objects)
      delete this.pendingPushes[pushId]
      if (setLastSyncDate) {
        setLastSyncDate(new Date())
      }
      syncEventEmitter.emit(`${name}_synced`)
    })
    // 4
    socketIO.on(`${name}_pushed_error`, (pushId: string, error: Error) => {
      console.warn(`${this.name}: pushed_error`, pushId, error)
      this.pendingPushes[pushId]?.rej(error)
      delete this.pendingPushes[pushId]
      syncEventEmitter.emit(`${name}_sync_errored`, error)
    })
  }

  // 1
  sync = async () => {
    if (!sharedSessionStore.user?.token || !socketIO.connected) {
      return
    }
    console.warn(`${this.name}: sync`, this.latestSyncDate())
    socketIO.emit(`sync_${this.name}`, this.latestSyncDate())
  }

  // 3
  private pushObjects = (objects: T): Promise<T> => {
    return new Promise<T>((res, rej) => {
      const pushId = uuid()
      this.pendingPushes[pushId] = { res, rej }
      console.warn(
        `${this.name}: pushObjects`,
        pushId,
        Array.isArray(objects) ? objects.length : 1
      )
      socketIO.emit(
        `push_${this.name}`,
        pushId,
        objects,
        sharedSessionStore.encryptionKey
      )
    })
  }
}

class SocketManager {
  pendingPushes = {} as PromiseMap

  todoSyncManager: SyncManager<Todo[]>
  tagsSyncManager: SyncManager<Tag[]>
  settingsSyncManager: SyncManager<Settings>
  heroSyncManager: SyncManager<Hero>
  userSyncManager: SyncManager<User>

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
      (objects, pushBack) => {
        return sharedTodoStore.onObjectsFromServer(
          objects,
          pushBack as () => Promise<Todo[]>
        )
      },
      (lastSyncDate) => {
        sharedTodoStore.lastSyncDate = new Date(lastSyncDate)
      }
    )
    this.tagsSyncManager = new SyncManager<Tag[]>(
      'tags',
      this.pendingPushes,
      () => sharedTagStore.lastSyncDate,
      (objects, pushBack) => {
        return sharedTagStore.onObjectsFromServer(
          objects,
          pushBack as () => Promise<Tag[]>
        )
      },
      (lastSyncDate) => {
        sharedTagStore.lastSyncDate = new Date(lastSyncDate)
      }
    )
    this.settingsSyncManager = new SyncManager<Settings>(
      'settings',
      this.pendingPushes,
      () => sharedSettingsStore.updatedAt,
      (objects, pushBack) => {
        return sharedSettingsStore.onObjectsFromServer(objects, pushBack)
      }
    )
    this.userSyncManager = new SyncManager<User>(
      'user',
      this.pendingPushes,
      () => sharedSessionStore.user?.updatedAt,
      (objects, pushBack) => {
        return sharedSessionStore.onObjectsFromServer(objects, pushBack)
      }
    )
    this.heroSyncManager = new SyncManager<Hero>(
      'hero',
      this.pendingPushes,
      () => sharedHeroStore.updatedAt,
      (objects, pushBack) => {
        return sharedHeroStore.onObjectsFromServer(objects, pushBack)
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

  hardSync = () => {
    if (!isHydrated()) {
      return
    }
    sharedTodoStore.lastSyncDate = undefined
    this.globalSync()
  }

  globalSync = () => {
    if (!isHydrated()) {
      return
    }
    this.todoSyncManager.sync()
    this.tagsSyncManager.sync()
    this.settingsSyncManager.sync()
    this.userSyncManager.sync()
    this.heroSyncManager.sync()
  }
}

export const sockets = new SocketManager()
