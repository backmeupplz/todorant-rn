import { isHydrated } from '@stores/hydration/hydratedStores'
import { syncEventEmitter } from '@sync/syncEventEmitter'
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
import { SyncRequestEvent } from '@sync/SyncRequestEvent'
import uuid from 'uuid'
import { observable } from 'mobx'
import { Todo } from '@models/Todo'
import { Tag } from '@models/Tag'
import {
  getLastSyncDate,
  LastSyncDateType,
  onTagsObjectsFromServer,
  onTodosObjectsFromServer,
  updateLastSyncDate,
} from './SyncObjectHandlers'
import { alertConfirm } from '@utils/alert'

class Sync {
  private socketConnection = new SocketConnection()
  private pendingAuthorizations: {
    res?: () => void
    rej?: (reason: string) => void
  }[] = []
  private syncPromises: {
    [index: string]: { res: Function; rej: Function }
  } = {}
  private settingsSyncManager: SyncManager<Settings>
  private userSyncManager: SyncManager<User>
  private heroSyncManager: SyncManager<Hero>
  private todoSyncManager: SyncManager<Todo[]>
  private tagsSyncManager: SyncManager<Tag[]>
  // private delegationSyncManager: SyncManager<any>

  // TODO: populate with real data
  @observable connected = false
  @observable authorized = false
  @observable isSyncing = false
  @observable connectionError?: string = undefined

  constructor() {
    // this.setupWorkerListeners()
    this.setupSyncListeners()
    // Setup sync managers
    this.settingsSyncManager = new SyncManager<Settings>(
      this.socketConnection,
      'settings',
      () => Promise.resolve(sharedSettingsStore.updatedAt),
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
      () => Promise.resolve(sharedSessionStore.user?.updatedAt),
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
      () => Promise.resolve(sharedHeroStore.updatedAt),
      (objects, pushBack, completeSync) => {
        return sharedHeroStore.onObjectsFromServer(
          objects,
          pushBack,
          completeSync
        )
      }
    )
    this.todoSyncManager = new SyncManager<Todo[]>(
      this.socketConnection,
      'todos',
      () => getLastSyncDate(LastSyncDateType.Todos),
      (objects, pushBack, completeSync) => {
        return onTodosObjectsFromServer(
          objects,
          pushBack as () => Promise<Todo[]>,
          completeSync
        )
      },
      async (lastSyncDate) =>
        updateLastSyncDate(LastSyncDateType.Todos, lastSyncDate)
    )
    this.tagsSyncManager = new SyncManager<Tag[]>(
      this.socketConnection,
      'tags',
      () => getLastSyncDate(LastSyncDateType.Tags),
      (objects, pushBack, completeSync) => {
        return onTagsObjectsFromServer(
          objects,
          pushBack as () => Promise<Tag[]>,
          completeSync
        )
      },
      async (lastSyncDate) =>
        updateLastSyncDate(LastSyncDateType.Tags, lastSyncDate)
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
    this.sendMessageToWorker({
      type: MainMessageType.LogoutRequest,
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
      // All
      case SyncRequestEvent.All:
        return Promise.all([
          this.settingsSyncManager.sync(),
          this.userSyncManager.sync(),
          this.heroSyncManager.sync(),
          this.todoSyncManager.sync(),
          this.tagsSyncManager.sync(),
          // this.syncWithWorker(SyncRequestEvent.Todo),
          // this.syncWithWorker(SyncRequestEvent.Tag),
          // this.syncWithWorker(SyncRequestEvent.Delegation),
        ])
      // Non-realm syncs
      case SyncRequestEvent.Settings:
        return this.settingsSyncManager.sync()
      case SyncRequestEvent.User:
        return this.userSyncManager.sync()
      case SyncRequestEvent.Hero:
        return this.heroSyncManager.sync()
      // Realm syncs
      case SyncRequestEvent.Todo:
        return this.todoSyncManager.sync()
      // Shouldn't happen
      case SyncRequestEvent.Tag:
        return this.tagsSyncManager.sync()
      default:
        return Promise.resolve()
    }
  }

  private setupWorkerListeners() {
    // sharedSyncWorker.onmessage = (message: string) => {
    //   const parsedMessage = JSON.parse(message) as WorkerMesage
    //   switch (parsedMessage.type) {
    //     case WorkerMessageType.AuthorizationCompleted:
    //       this.authorizationCompleted(parsedMessage.error)
    //       break
    //     case WorkerMessageType.SyncCompleted:
    //       this.syncWithWorkerCompleted(parsedMessage)
    //       break
    //     default:
    //       break
    //   }
    // }
  }

  private setupSyncListeners() {
    syncEventEmitter.on(SyncRequestEvent.All, () => {
      this.sync(SyncRequestEvent.All)
    })
    syncEventEmitter.on(SyncRequestEvent.Todo, () => {
      this.sync(SyncRequestEvent.Todo)
    })
    syncEventEmitter.on(SyncRequestEvent.Tag, () => {
      this.sync(SyncRequestEvent.Tag)
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
      this.sync(SyncRequestEvent.Delegation)
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

  private syncWithWorker(syncRequestEvent: SyncRequestEvent) {
    const syncId = uuid()
    return new Promise((res, rej) => {
      this.syncPromises[syncId] = { res, rej }
      this.sendMessageToWorker({
        type: MainMessageType.SyncRequest,
        syncRequestEvent,
        syncId,
      })
    })
  }

  private syncWithWorkerCompleted(message: WorkerMesage) {
    if (!message.syncId || !this.syncPromises[message.syncId]) {
      return
    }
    if (message.error) {
      this.syncPromises[message.syncId].rej(message.error)
    } else {
      this.syncPromises[message.syncId].res()
    }
    delete this.syncPromises[message.syncId]
  }

  private sendMessageToWorker(message: MainMessage) {
    // sharedSyncWorker.postMessage(JSON.stringify(message))
  }
}

export const sharedSync = new Sync()
