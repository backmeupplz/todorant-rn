import { MainMessage, MainMessageType } from '@utils/sockets/MainMessage'
import { SocketConnection } from '@utils/sockets/SocketConnection'
import { WorkerMesage, WorkerMessageType } from '@utils/sockets/WorkerMessage'
import { socketEventEmitter } from '@utils/sockets/socketEventEmitter'
import { sharedDelegationStore } from '@stores/DelegationStore'
import { sharedHeroStore } from '@stores/HeroStore'
import { sharedSessionStore } from '@stores/SessionStore'
import { sharedSettingsStore } from '@stores/SettingsStore'
import { sharedTagStore } from '@stores/TagStore'
import { sharedTodoStore } from '@stores/TodoStore'
import { isHydrated } from '@utils/hydration/hydratedStores'
import { SyncRequestEvent } from '@utils/sockets/SyncRequestEvent'
import { Thread } from 'react-native-threads'
import { v4 as uuid } from 'uuid'
import { WorkerEvent } from '@utils/sockets/SyncWorker/WorkerEvent'

const syncWorker = new Thread(`./SyncWorker/index.js`)
class SocketManager {
  private socketConnection = new SocketConnection()
  private pendingAuthorizations: {
    res?: () => void
    rej?: (reason: string) => void
  }[] = []
  private pendingSyncs: {
    [index: string]: {
      res?: () => void
      rej?: (reason: string) => void
    }
  } = {}

  constructor() {
    this.setupSyncListeners()
    this.setupWorkerListeners()
  }

  authorize = () => {
    return new Promise<void>(async (res, rej) => {
      // Main socket connection
      this.socketConnection.token = sharedSessionStore.user?.token
      await this.socketConnection.authorize()
      // Worker socket connection
      this.pendingAuthorizations.push({ res, rej })
      this.sendMessageToWorker({
        type: MainMessageType.AuthorizationRequest,
        token: sharedSessionStore.user?.token,
      })
    })
  }

  sync(event: SyncRequestEvent = SyncRequestEvent.All) {
    return new Promise<void>((res, rej) => {
      const syncId = uuid()
      this.pendingSyncs[syncId] = {
        res: res,
        rej: rej,
      }
      syncWorker.postMessage({
        name: event,
        syncId,
      })
    })
  }

  private setupSyncListeners() {
    socketEventEmitter.on(SyncRequestEvent.All, () => {
      this.sync(SyncRequestEvent.All)
    })
    socketEventEmitter.on(SyncRequestEvent.Todo, () => {
      this.sync(SyncRequestEvent.Todo)
    })
    socketEventEmitter.on(SyncRequestEvent.Tag, () => {
      this.sync(SyncRequestEvent.Tag)
    })
    socketEventEmitter.on(SyncRequestEvent.Settings, () => {
      this.sync(SyncRequestEvent.Settings)
    })
    socketEventEmitter.on(SyncRequestEvent.User, () => {
      this.sync(SyncRequestEvent.User)
    })
    socketEventEmitter.on(SyncRequestEvent.Hero, () => {
      this.sync(SyncRequestEvent.Hero)
    })
    socketEventEmitter.on(SyncRequestEvent.Delegation, () => {
      this.sync(SyncRequestEvent.Delegation)
    })
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

  private syncCompleted(syncId: string, error?: string) {
    const pendingSync = this.pendingSyncs[syncId]
    if (!pendingSync) {
      return
    }
    if (error && pendingSync.rej) {
      pendingSync.rej(error)
    } else if (pendingSync.res) {
      pendingSync.res()
    }
  }

  private sendMessageToWorker(message: MainMessage) {}

  logout = () => {
    sharedTodoStore.logout()
    sharedTagStore.logout()
    sharedSettingsStore.logout()
    sharedHeroStore.logout()
    sharedDelegationStore.logout()

    syncWorker.sendMessage({
      name: WorkerEvent.LogoutRequest,
    })
  }

  hardSync = () => {
    sharedTodoStore.lastSyncDate = undefined
    return this.globalSync()
  }

  globalSync = () => {
    if (!isHydrated()) {
      throw new Error("Stores didn't hydrate yet")
    }
    return this.sync(SyncRequestEvent.All)
  }
}

export const sockets = new SocketManager()
