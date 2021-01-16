import { isHydrated } from '@stores/hydration/hydratedStores'
import { syncEventEmitter } from './syncEventEmitter'
import { sharedHeroStore } from '@stores/HeroStore'
import { sharedSessionStore } from '@stores/SessionStore'
import { sharedSettingsStore } from '@stores/SettingsStore'
import { Hero } from '@models/Hero'
import { User } from '@models/User'
import { Settings } from '@models/Settings'
import { SyncManager } from '@sync/SyncManager'
import { MainMessage, MainMessageType } from '@sync/MainMessage'
import { SocketConnection } from '@sync/sockets/SocketConnection'
import { WorkerMesage, WorkerMessageType } from '@sync/WorkerMessage'
import { Thread } from 'react-native-threads'
import { SyncRequestEvent } from '@sync/SyncRequestEvent'

const syncWorker = new Thread(`./SyncWorker.js`)

class Sync {
  private socketConnection = new SocketConnection()
  private pendingAuthorizations: {
    res?: () => void
    rej?: (reason: string) => void
  }[] = []
  private settingsSyncManager: SyncManager<Settings>
  private userSyncManager: SyncManager<User>
  private heroSyncManager: SyncManager<Hero>

  constructor() {
    this.setupWorkerListeners()
    this.setupSyncListeners()
    // Setup sync managers
    this.settingsSyncManager = new SyncManager<Settings>(
      this.socketConnection,
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
      this.socketConnection,
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
      this.socketConnection,
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
  }

  login = (token: string) => {
    return new Promise<void>(async (res, rej) => {
      // Main socket connection
      this.socketConnection.token = token
      await this.socketConnection.authorize()
      // Worker socket connection
      this.pendingAuthorizations.push({ res, rej })
      this.sendMessageToWorker({
        type: MainMessageType.AuthorizationRequest,
        token: token,
      })
    })
  }

  logout = () => {
    this.socketConnection.logout()
    syncWorker.sendMessage({
      name: MainMessageType.LogoutRequest,
    })
  }

  hardSync = () => {
    // Outdate local versions
    sharedSettingsStore.updatedAt = undefined
    if (sharedSessionStore.user) {
      sharedSessionStore.user.updatedAt = undefined
    }
    sharedHeroStore.updatedAt = undefined
    // Sync
    return this.globalSync()
  }

  globalSync = () => {
    if (!isHydrated()) {
      return Promise.reject("Global sync: stores didn't hydrate yet")
    }
    return this.sync()
  }

  sync(event: SyncRequestEvent = SyncRequestEvent.All): Promise<unknown> {
    switch (event) {
      case SyncRequestEvent.All:
        return Promise.all([
          this.settingsSyncManager.sync(),
          this.userSyncManager.sync(),
          this.heroSyncManager.sync(),
        ])
      case SyncRequestEvent.Settings:
        return this.settingsSyncManager.sync()
      case SyncRequestEvent.User:
        return this.userSyncManager.sync()
      case SyncRequestEvent.Hero:
        return this.heroSyncManager.sync()
      default:
        return Promise.resolve()
    }
  }

  private setupWorkerListeners() {
    syncWorker.onmessage = (message: WorkerMesage) => {
      switch (message.type) {
        case WorkerMessageType.AuthorizationCompleted:
          this.authorizationCompleted(message.error)
          break
        default:
          break
      }
    }
  }

  private setupSyncListeners() {
    syncEventEmitter.on(SyncRequestEvent.All, () => {
      // Todo
    })
    syncEventEmitter.on(SyncRequestEvent.Todo, () => {
      // Todo
    })
    syncEventEmitter.on(SyncRequestEvent.Tag, () => {
      // Todo
    })
    syncEventEmitter.on(SyncRequestEvent.Settings, () => {
      this.sync(SyncRequestEvent.Settings)
    })
    syncEventEmitter.on(SyncRequestEvent.User, () => {
      this.sync(SyncRequestEvent.User)
    })
    syncEventEmitter.on(SyncRequestEvent.Hero, () => {
      this.sync(SyncRequestEvent.Hero)
    })
    syncEventEmitter.on(SyncRequestEvent.Delegation, () => {
      // Todo
    })
  }

  private authorizationCompleted(error?: string) {
    this.pendingAuthorizations.forEach((authorization) => {
      if (error && authorization.rej) {
        authorization.rej(error)
      } else if (!error && authorization.res) {
        authorization.res()
      }
    })
    this.pendingAuthorizations = []
  }

  private sendMessageToWorker(message: MainMessage) {
    syncWorker.postMessage(message)
  }
}

export const sharedSync = new Sync()
