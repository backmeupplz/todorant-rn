import { MelonTag } from '@models/MelonTag'
import { MelonTodo, MelonUser } from '@models/MelonTodo'
import { getTitle } from '@models/Todo'
import { Q, RawRecord } from '@nozbe/watermelondb'
import {
  SyncArgs,
  SyncDatabaseChangeSet,
  synchronize,
  SyncPushArgs,
} from '@nozbe/watermelondb/sync'
import { sharedTodoStore } from '@stores/TodoStore'
import { onWMDBObjectsFromServer } from '@sync/SyncObjectHandlers'
import { alertError, alertMessage } from '@utils/alert'
import { decrypt, encrypt } from '@utils/encryption'
import { translate } from '@utils/i18n'
import { TagColumn, TodoColumn } from '@utils/watermelondb/tables'
import {
  database,
  tagsCollection,
  todosCollection,
  usersCollection,
} from '@utils/watermelondb/wmdb'
import { cloneDeep } from 'lodash'
import { makeObservable, observable, reaction, when } from 'mobx'
import { Alert } from 'react-native'
import { SocketConnection } from '../sockets/SocketConnection'
import { Mutex } from './mutex'

const wmdbGetLastPullAt =
  require('@nozbe/watermelondb/sync/impl').getLastPulledAt

// Using built-in SyncLogger
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
  }

  getServerData = async (lastPulledAt: number | null) => {
    // Get last wmdb sync date
    // Request for changes from server
    this.socketConnection.socketIO.emit('get_wmdb', lastPulledAt)
    const { serverObjects, serverTimeStamp } = await new Promise<{
      serverObjects: SyncDatabaseChangeSet
      serverTimeStamp: number | null
    }>((resolve) => {
      this.wmdbResponse = resolve
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
        const user = await usersCollection.find(sqlRaw.user_id)
        if (!user) {
          sqlRaw.is_deleted = true
          return
        } else {
          sqlRaw.user_id = user._id
        }
      }
      if (sqlRaw.delegator_id) {
        const delegator = await usersCollection.find(sqlRaw.delegator_id)
        if (!delegator) {
          sqlRaw.is_deleted = true
        } else {
          sqlRaw.delegator_id = delegator._id
        }
      }
      if (sqlRaw.is_encrypted) {
        sqlRaw.text = encrypt(sqlRaw.text)
      }
      updatedTodos.push(sqlRaw)
    }
    clonedChanges.todos.created = createdTodos
    clonedChanges.todos.updated = updatedTodos
    this.socketConnection.socketIO.emit(
      'push_wmdb',
      clonedChanges,
      lastPulledAt
    )
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
        alertError(translate('syncError'))
      } finally {
        if (__DEV__) {
          console.log(logger.formattedLogs)
        }
        this.isSyncing = false
        sharedTodoStore.refreshTodos()
      }
    })
}
