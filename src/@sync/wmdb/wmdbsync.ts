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
import { onWMDBObjectsFromServer } from '@sync/SyncObjectHandlers'
import { alertError, alertMessage } from '@utils/alert'
import { decrypt, encrypt } from '@utils/encryption'
import { TagColumn, TodoColumn } from '@utils/watermelondb/tables'
import {
  database,
  tagsCollection,
  todosCollection,
  usersCollection,
} from '@utils/watermelondb/wmdb'
import { cloneDeep } from 'lodash'
import { makeObservable, observable, when } from 'mobx'
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

  serverRequest?: Promise<void>

  @observable gotWmDb = false

  private serverTimeStamp?: number
  private serverObjects?: SyncDatabaseChangeSet

  constructor(socketConnection: SocketConnection) {
    makeObservable(this)
    this.socketConnection = socketConnection
    this.socketConnection.socketIO.on('wmdb', this.sync)
    this.socketConnection.socketIO.on(
      'return_wmdb',
      async (serverObjects: SyncDatabaseChangeSet, serverTimeStamp: number) => {
        await onWMDBObjectsFromServer(serverObjects)
        this.serverTimeStamp = serverTimeStamp
        this.serverObjects = serverObjects
        this.gotWmDb = true
      }
    )

    this.socketConnection.socketIO.on(
      'complete_wmdb',
      async (pushedBack?: { todos: MelonTodo[]; tags: MelonTag[] }) => {
        this.serverTimeStamp = undefined
        this.serverObjects = undefined
        if (pushedBack?.todos.length) {
          for (const todo of pushedBack.todos) {
            const localTodo = await todosCollection.find(todo._tempSyncId)
            if (!localTodo || !todo._id) {
              return
            }
            await localTodo.setServerId(todo._id)
          }
        }
        if (pushedBack?.tags.length) {
          for (const tag of pushedBack.tags) {
            const localTag = await tagsCollection.find(tag._tempSyncId)
            if (!localTag || !tag._id) {
              return
            }
            await localTag.setServerId(tag._id)
          }
        }
        this.gotWmDb = false
      }
    )
  }

  getServerData = async () => {
    // Get last wmdb sync date
    const lastPulledAt = await wmdbGetLastPullAt(database)
    // Request for changes from server
    this.socketConnection.socketIO.emit('get_wmdb', new Date(lastPulledAt))
    // Wait until get server changes
    if (!this.serverRequest) this.serverRequest = when(() => this.gotWmDb)
    await this.serverRequest
    return {
      serverObjects: this.serverObjects,
      serverTimeStamp: this.serverTimeStamp,
    }
  }

  pushObjectsHandler = async ({ changes, lastPulledAt }: SyncPushArgs) => {
    const createdTodos = []
    const updatedTodos = []
    const clonedChanges = cloneDeep(changes)
    for (const sqlRaw of clonedChanges.todos.created) {
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
      let pushed = false
      // Get server data
      const { serverObjects: changes, serverTimeStamp: timestamp } =
        await this.getServerData()
      // Start sync
      try {
        await synchronize({
          pullChanges: async () => {
            return {
              changes,
              timestamp,
            }
          },
          pushChanges: (args) => {
            pushed = true
            return this.pushObjectsHandler(args)
          },
          migrationsEnabledAtVersion: 1,
          log: __DEV__ ? logger.newLog() : undefined,
          sendCreatedAsUpdated: true,
          database,
          conflictResolver: this.conflictResolver,
        } as SyncType)
      } catch (err) {
        console.error(err)
      } finally {
        if (__DEV__) {
          console.log(logger.formattedLogs)
        }
        this.gotWmDb = false
        this.serverRequest = undefined
        this.isSyncing = false
        this.serverObjects = undefined
      }
    })
}
