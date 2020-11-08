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

class SocketManager {
  todoSyncManager: SyncManager<Todo[]>
  tagsSyncManager: SyncManager<Tag[]>
  settingsSyncManager: SyncManager<Settings>
  heroSyncManager: SyncManager<Hero>
  userSyncManager: SyncManager<User>
  delegationSyncManager: SyncManager<any>

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
    this.connect()
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
