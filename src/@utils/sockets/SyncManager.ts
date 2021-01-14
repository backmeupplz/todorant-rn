import { sharedSessionStore } from '@stores/SessionStore'
import { sharedSocketStore } from '@stores/SocketStore'
import {
  checkPromiseMapForTimeout,
  PromiseMapType,
} from '@utils/sockets/checkPromiseMapForTimeout'
import { PromiseMap } from '@utils/sockets/PromiseMap'
import { socketIO } from '@utils/sockets/socketIO'
import { SyncStage } from '@utils/sockets/SyncStage'
import { makeObservable, observable } from 'mobx'
import uuid from 'uuid'

export class SyncManager<T> {
  name: string
  pendingSyncs: PromiseMap = {}
  pendingPushes: PromiseMap = {}
  latestSyncDate: () => Date | undefined
  setLastSyncDate: ((latestSyncDate: Date) => void) | undefined

  @observable isSyncing = false
  queuedSyncPromise:
    | { promise: Promise<unknown>; res?: Function; rej?: Function }
    | undefined = undefined

  onObjectsFromServer: (
    objects: T,
    pushBack: (objects: T) => Promise<T>,
    completeSync: () => void
  ) => Promise<void>

  // 0
  constructor(
    name: string,
    latestSyncDate: () => Date | undefined,
    onObjectsFromServer: (
      objects: T,
      pushBack: (objects: T) => Promise<T>,
      completeSync: () => void
    ) => Promise<void>,
    setLastSyncDate?: (latestSyncDate: Date) => void
  ) {
    makeObservable(this)

    this.name = name
    this.latestSyncDate = latestSyncDate
    this.onObjectsFromServer = onObjectsFromServer
    this.setLastSyncDate = setLastSyncDate

    // -1
    socketIO.on(`${name}_sync_request`, () => {
      console.warn(`${this.name}: sync_request`)
      this.sync()
    })

    // 2
    socketIO.on(name, async (response: T, syncId: string) => {
      console.warn(
        `${this.name}: onObjectsFromServer`,
        Array.isArray(response) ? response.length : 1
      )
      this.setSyncStage(syncId, SyncStage.gotObjectsFromServer)
      try {
        await onObjectsFromServer(
          response,
          (objects) => this.pushObjects(objects, syncId),
          () => {
            this.completeSync(syncId)
          }
        )
      } catch (err) {
        this.rejectSync(typeof err === 'string' ? err : err.message, syncId)
      }
    })
    // 4
    socketIO.on(`${name}_pushed`, (objects: T, syncId: string) => {
      this.setSyncStage(syncId, SyncStage.gotPushedBackObjectsFromServer)
      console.warn(
        `${this.name}: pushed`,
        Array.isArray(objects) ? objects.length : 1,
        syncId
      )
      this.pendingPushes[syncId]?.res(objects)
      delete this.pendingPushes[syncId]
    })
    // Can happen any time
    socketIO.on(`${name}_sync_error`, (reason: string, syncId: string) => {
      console.warn(`${this.name}: sync_error`, reason, syncId)
      this.rejectSync(reason, syncId)
    })
    // Start checking for timed out promises
    setInterval(() => {
      checkPromiseMapForTimeout(this.pendingSyncs)
      checkPromiseMapForTimeout(
        this.pendingPushes,
        PromiseMapType.pendingPushes
      )
    }, 1000)
  }

  // 1
  sync = async () => {
    // Check if authorized
    if (!socketIO.connected) {
      return Promise.reject('Not connected to sockets')
    }
    if (!sharedSessionStore.user?.token || !sharedSocketStore.authorized) {
      return Promise.reject('Not authorized')
    }
    // Check if already syncing
    if (this.isSyncing) {
      if (this.queuedSyncPromise) {
        return this.queuedSyncPromise.promise
      } else {
        this.queuedSyncPromise = {
          promise: new Promise((res, rej) => {
            if (this.queuedSyncPromise) {
              this.queuedSyncPromise.res = res
              this.queuedSyncPromise.rej = rej
            }
          }),
        }
        return this.queuedSyncPromise.promise
      }
    }
    // Set syncing flag to true
    this.isSyncing = true
    // Sync
    const syncId = uuid()
    if (this.queuedSyncPromise) {
      const queuedSyncPromise = this.queuedSyncPromise
      this.queuedSyncPromise = undefined
      console.warn(`${this.name}: sync (queued)`, this.latestSyncDate(), syncId)
      this.pendingSyncs[syncId] = {
        // Res and rej should be there right away after the promise is created
        res: queuedSyncPromise.res!,
        rej: queuedSyncPromise.rej!,
        createdAt: Date.now(),
        syncStage: SyncStage.syncRequested,
      }
      socketIO.emit(`sync_${this.name}`, this.latestSyncDate(), syncId)
      return queuedSyncPromise.promise
    } else {
      console.warn(`${this.name}: sync`, this.latestSyncDate(), syncId)
      return new Promise((res, rej) => {
        this.pendingSyncs[syncId] = {
          res,
          rej,
          createdAt: Date.now(),
          syncStage: SyncStage.syncRequested,
        }
        socketIO.emit(`sync_${this.name}`, this.latestSyncDate(), syncId)
      })
    }
  }

  // 3
  private pushObjects = (objects: T, syncId: string): Promise<T> => {
    this.setSyncStage(syncId, SyncStage.pushingObjectsToServer)
    return new Promise<T>((res, rej) => {
      this.pendingPushes[syncId] = { res, rej, createdAt: Date.now() }
      console.warn(
        `${this.name}: pushObjects`,
        syncId,
        Array.isArray(objects) ? objects.length : 1
      )
      socketIO.emit(
        `push_${this.name}`,
        syncId,
        objects,
        sharedSessionStore.encryptionKey
      )
    })
  }

  private completeSync = (syncId: string) => {
    console.warn(`${this.name}: completeSync called for ${syncId}`)
    if (this.pendingSyncs[syncId]) {
      this.pendingSyncs[syncId].res(this.checkIfNeedsAnotherSync())
      delete this.pendingSyncs[syncId]
    } else {
      this.checkIfNeedsAnotherSync()
    }
  }

  private checkIfNeedsAnotherSync() {
    if (this.queuedSyncPromise) {
      this.isSyncing = false
      return this.sync()
    } else {
      if (this.setLastSyncDate) {
        this.setLastSyncDate(new Date())
      }
      console.warn(`${this.name} sync completed!`)
      this.isSyncing = false
    }
  }

  private rejectSync(reason: string, syncId: string) {
    console.warn(`${this.name} rejectSync ${reason} ${syncId}`)
    if (this.pendingSyncs[syncId]?.rej) {
      this.pendingSyncs[syncId]?.rej(reason)
      delete this.pendingSyncs[syncId]
    }
    this.isSyncing = false
    this.checkIfNeedsAnotherSync()
  }

  private setSyncStage(syncId: string, stage: SyncStage) {
    if (this.pendingSyncs[syncId]) {
      this.pendingSyncs[syncId].syncStage = stage
    }
  }
}
