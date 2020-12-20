import { Hero } from '@models/Hero'
import { Settings } from '@models/Settings'
import { Tag } from '@models/Tag'
import { Todo } from '@models/Todo'
import { User } from '@models/User'
import { sharedDelegationStore } from '@stores/DelegationStore'
import { sharedHeroStore } from '@stores/HeroStore'
import { sharedSessionStore } from '@stores/SessionStore'
import { sharedSettingsStore } from '@stores/SettingsStore'
import { sharedSocketStore } from '@stores/SocketStore'
import { sharedTagStore } from '@stores/TagStore'
import { sharedTodoStore } from '@stores/TodoStore'
import { isHydrated } from '@utils/hydrated'
import { socketIO } from '@utils/sockets/socketIO'
import { SyncManager } from '@utils/sockets/SyncManager'
import { computed } from 'mobx'

class SocketManager {
  todoSyncManager: SyncManager<Todo[]>
  tagsSyncManager: SyncManager<Tag[]>
  settingsSyncManager: SyncManager<Settings>
  heroSyncManager: SyncManager<Hero>
  userSyncManager: SyncManager<User>
  delegationSyncManager: SyncManager<any>

  pendingAuthorization?: {
    res: () => void
    rej: (reason: string) => void
    createdAt: number
  }

  @computed get isSyncing() {
    return (
      this.todoSyncManager.isSyncing ||
      this.tagsSyncManager.isSyncing ||
      this.settingsSyncManager.isSyncing ||
      this.heroSyncManager.isSyncing ||
      this.userSyncManager.isSyncing ||
      this.delegationSyncManager.isSyncing
    )
  }

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
      () => sharedTodoStore.lastSyncDate,
      (objects, pushBack, completeSync) => {
        return sharedTodoStore.onObjectsFromServer(
          objects,
          pushBack as () => Promise<Todo[]>,
          completeSync
        )
      },
      (lastSyncDate) => {
        sharedTodoStore.lastSyncDate = new Date(lastSyncDate)
      }
    )
    this.tagsSyncManager = new SyncManager<Tag[]>(
      'tags',
      () => sharedTagStore.lastSyncDate,
      (objects, pushBack, completeSync) => {
        return sharedTagStore.onObjectsFromServer(
          objects,
          pushBack as () => Promise<Tag[]>,
          completeSync
        )
      },
      (lastSyncDate) => {
        sharedTagStore.lastSyncDate = new Date(lastSyncDate)
      }
    )
    this.settingsSyncManager = new SyncManager<Settings>(
      'settings',
      () => sharedSettingsStore.updatedAt,
      (objects, pushBack, completeSync) => {
        return sharedSettingsStore.onObjectsFromServer(
          objects,
          pushBack,
          completeSync
        )
      }
    )
    this.userSyncManager = new SyncManager<User>(
      'user',
      () => sharedSessionStore.user?.updatedAt,
      (objects, pushBack, completeSync) => {
        return sharedSessionStore.onObjectsFromServer(
          objects,
          pushBack,
          completeSync
        )
      }
    )
    this.heroSyncManager = new SyncManager<Hero>(
      'hero',
      () => sharedHeroStore.updatedAt,
      (objects, pushBack, completeSync) => {
        return sharedHeroStore.onObjectsFromServer(
          objects,
          pushBack,
          completeSync
        )
      }
    )
    this.delegationSyncManager = new SyncManager<any>(
      'delegate',
      () => undefined,
      (objects, _, completeSync) => {
        return sharedDelegationStore.onObjectsFromServer(objects, completeSync)
      }
    )

    // Check authorization promise timeout
    setInterval(() => {
      if (!this.pendingAuthorization) {
        return
      }
      const timeout = 20
      if (Date.now() - this.pendingAuthorization.createdAt > timeout * 1000) {
        this.pendingAuthorization.rej('Operation timed out')
        this.pendingAuthorization = undefined
      }
    }, 1000)

    // Check connection (if not dev)
    setInterval(() => {
      this.connect()
    }, 1000)
  }

  connect = () => {
    if (socketIO.connected) {
      return
    }
    try {
      socketIO.connect()
    } catch (err) {
      console.warn('Socket connection error', err)
    }
  }
  authorize = () => {
    return new Promise<void>((res, rej) => {
      if (!sharedSessionStore.user?.token || !socketIO.connected) {
        return rej('Not connected to sockets')
      }
      if (sharedSocketStore.authorized) {
        return res()
      }
      this.pendingAuthorization = { res, rej, createdAt: Date.now() }
      socketIO.emit('authorize', sharedSessionStore.user.token, '1')
    })
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
    this.connect()
  }

  onConnectError = (error: Error) => {
    sharedSocketStore.connectionError = error
  }
  onConnectTimeout = () => {
    console.warn('ws connect timeout')
  }
  onError = (err: any) => {
    console.warn('ws error', err)
  }

  onAuthorized = () => {
    sharedSocketStore.authorized = true
    this.pendingAuthorization?.res()
    this.pendingAuthorization = undefined
    this.globalSync()
  }

  hardSync = () => {
    sharedTodoStore.lastSyncDate = undefined
    return this.globalSync()
  }

  globalSync = () => {
    if (!isHydrated()) {
      throw new Error("Stores didn't hydrate yet")
    }
    return Promise.all([
      this.todoSyncManager.sync(),
      this.tagsSyncManager.sync(),
      this.settingsSyncManager.sync(),
      this.userSyncManager.sync(),
      this.heroSyncManager.sync(),
      this.delegationSyncManager.sync(),
    ])
  }
}

export const sockets = new SocketManager()
