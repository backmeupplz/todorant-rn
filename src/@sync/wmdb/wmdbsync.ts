import { Mutex } from '@sync/wmdb/mutex'
import { RawRecord } from '@nozbe/watermelondb'
import { SocketConnection } from '@sync/sockets/SocketConnection'
import {
  SyncArgs,
  SyncDatabaseChangeSet,
  SyncPushArgs,
  synchronize,
} from '@nozbe/watermelondb/sync'
import { alertError } from '@utils/alert'
import { chunk, cloneDeep } from 'lodash'
import { database, usersCollection } from '@utils/watermelondb/wmdb'
import { encrypt } from '@utils/encryption'
import { getDateMonthAndYearString } from '@utils/time'
import { makeObservable, observable } from 'mobx'
import { onWMDBObjectsFromServer } from '@sync/SyncObjectHandlers'
import { sharedSessionStore } from '@stores/SessionStore'
import { sharedTodoStore } from '@stores/TodoStore'
import { translate } from '@utils/i18n'

// Using built-in SyncLogger
// eslint-disable-next-line @typescript-eslint/no-var-requires
const SyncLogger = require('@nozbe/watermelondb/sync/SyncLogger').default
const logger = new SyncLogger(1 /* limit of sync logs to keep in memory */)

type SyncRecord = RawRecord & { updated_at: number }

type SyncType = SyncArgs & {
  conflictResolver: (
    lastSyncDate: Date,
    local: SyncRecord,
    remote: SyncRecord,
    resolved: SyncRecord
  ) => void
}

export class WMDBSync {
  socketConnection: SocketConnection
  @observable isSyncing = false

  private wmdbResponse?: ({
    serverObjects,
    serverTimeStamp,
  }: {
    serverTimeStamp: number
    serverObjects: SyncDatabaseChangeSet
  }) => void

  private completeSync?: () => void

  private rejectSync?: (err: string) => void

  constructor(socketConnection: SocketConnection) {
    makeObservable(this)
    this.socketConnection = socketConnection
    this.socketConnection.socketIO.on('wmdb', this.sync)
    this.socketConnection.socketIO.on(
      'return_wmdb',
      async (serverObjects: SyncDatabaseChangeSet, serverTimeStamp: number) => {
        if (this.wmdbResponse) {
          this.wmdbResponse({ serverObjects, serverTimeStamp })
          return
        }
        alertError(translate('syncError'))
      }
    )
    this.socketConnection.socketIO.on('complete_wmdb', async () => {
      if (this.completeSync) {
        this.completeSync()
      }
    })
    this.socketConnection.socketIO.on(
      'wmdb_sync_error',
      async (error: string) => {
        if (this.rejectSync) {
          this.rejectSync(error)
        }
      }
    )
  }

  getServerData = async (lastPulledAt: number | null) => {
    // Get last wmdb sync date
    // Request for changes from server
    this.socketConnection.socketIO.emit('get_wmdb', lastPulledAt)
    const { serverObjects, serverTimeStamp } = await new Promise<{
      serverObjects: SyncDatabaseChangeSet
      serverTimeStamp: number | null
    }>((res, rej) => {
      this.wmdbResponse = res
      this.rejectSync = rej
    })
    await onWMDBObjectsFromServer(serverObjects)
    return {
      serverObjects,
      serverTimeStamp,
    }
  }

  pushObjectsHandler = async ({ changes, lastPulledAt }: SyncPushArgs) => {
    const createdTodos = []
    const updatedTodos = []
    const clonedChanges = cloneDeep(changes)
    for (const sqlRaw of clonedChanges.todos.created) {
      if (sqlRaw.server_id) {
        updatedTodos.push(sqlRaw)
        continue
      }
      if (sqlRaw.user_id) {
        sqlRaw.user_id = (await usersCollection.find(sqlRaw.user_id))._id
      }
      if (sqlRaw.delegator_id) {
        sqlRaw.delegator_id = (
          await usersCollection.find(sqlRaw.delegator_id)
        )._id
      }
      if (sqlRaw.is_encrypted) {
        sqlRaw.text = encrypt(sqlRaw.text)
      }
      createdTodos.push(sqlRaw)
    }
    for (const sqlRaw of clonedChanges.todos.updated) {
      if (sqlRaw.user_id) {
        try {
          const user = await usersCollection.find(sqlRaw.user_id)
          if (!user) {
            sqlRaw.is_deleted = true
            return
          } else {
            sqlRaw.user_id = user._id
          }
        } catch (err) {
          delete sqlRaw.user_id
        }
      }
      try {
        if (sqlRaw.delegator_id) {
          if (!sqlRaw.month_and_year) {
            sqlRaw.month_and_year = getDateMonthAndYearString(new Date())
          }
          const delegator = await usersCollection.find(sqlRaw.delegator_id)
          if (!delegator) {
            sqlRaw.is_deleted = true
          } else {
            sqlRaw.delegator_id = delegator._id
          }
        }
      } catch (err) {
        delete sqlRaw.delegator_id
      }
      if (sqlRaw.is_encrypted) {
        sqlRaw.text = encrypt(sqlRaw.text)
      }
      if (sqlRaw.server_id) {
        delete sqlRaw.id
      }
      updatedTodos.push(sqlRaw)
    }
    const chunkedCreated = chunk(createdTodos, 1000)
    const chunkedUpdated = chunk(updatedTodos, 1000)
    let lastSelectedChunk = 0
    while (
      lastSelectedChunk !=
      Math.max(chunkedUpdated.length, chunkedCreated.length) + 1
    ) {
      if (chunkedUpdated[lastSelectedChunk]) {
        clonedChanges.todos.updated = chunkedUpdated[lastSelectedChunk]
      }
      if (chunkedCreated[lastSelectedChunk]) {
        clonedChanges.todos.created = chunkedCreated[lastSelectedChunk]
      }
      this.socketConnection.socketIO.emit(
        'push_wmdb',
        clonedChanges,
        lastPulledAt,
        sharedSessionStore.encryptionKey
      )
      await new Promise<void>((res, rej) => {
        this.completeSync = res
        this.rejectSync = rej
      })
      clonedChanges.todos.updated = []
      clonedChanges.todos.created = []
      lastSelectedChunk++
    }
  }

  conflictResolver = (
    _: Date,
    local: SyncRecord,
    remote: SyncRecord,
    resolved: SyncRecord
  ) => {
    const localDate = new Date(local.updated_at)
    const remoteDate = new Date(remote.updated_at)
    remote.updated_at = Date.now()
    local.updated_at = Date.now()
    return Object.assign(resolved, remoteDate > localDate ? remote : local)
  }

  sync = () =>
    Mutex.dispatch(async () => {
      sharedTodoStore.refreshTodos()
      if (!this.socketConnection.connected) {
        return Promise.reject('Socket sync: not connected to sockets')
      }
      if (!this.socketConnection.authorized) {
        return Promise.reject('Socket sync: not authorized')
      }
      if (!this.socketConnection.token) {
        return Promise.reject('Socket sync: no authorization token provided')
      }
      this.isSyncing = true
      // Start sync
      try {
        await synchronize({
          pullChanges: async ({ lastPulledAt }) => {
            // Get server data
            const { serverObjects: changes, serverTimeStamp: timestamp } =
              await this.getServerData(lastPulledAt)
            return {
              changes,
              timestamp,
            }
          },
          pushChanges: async (args) => {
            await this.pushObjectsHandler(args)
          },
          migrationsEnabledAtVersion: 1,
          log: __DEV__ ? logger.newLog() : undefined,
          sendCreatedAsUpdated: true,
          database,
          conflictResolver: this.conflictResolver,
        } as SyncType)
      } catch (err) {
        console.error(err)
        alertError(err as string)
      } finally {
        if (__DEV__) {
          console.log(logger.formattedLogs)
        }
        this.isSyncing = false
        sharedTodoStore.refreshTodos()
      }
    })
}
