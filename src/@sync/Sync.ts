import { sharedTodoStore } from '@stores/TodoStore'
import { sharedTagStore } from '@stores/TagStore'
import { hydration } from '@stores/hydration/hydratedStores'
import { syncEventEmitter } from '@sync/syncEventEmitter'
import { sharedHeroStore } from '@stores/HeroStore'
import { sharedSessionStore } from '@stores/SessionStore'
import { sharedSettingsStore } from '@stores/SettingsStore'
import { Hero } from '@models/Hero'
import { User } from '@models/User'
import { Settings } from '@models/Settings'
import { SyncManager } from '@sync/SyncManager'
import { SocketConnection } from '@sync/sockets/SocketConnection'
import { SyncRequestEvent } from '@sync/SyncRequestEvent'
import { computed, makeObservable, observable, when } from 'mobx'
import { getTitle } from '@models/Todo'
import { onDelegationObjectsFromServer } from '@sync/SyncObjectHandlers'
import { sharedDelegationStore } from '@stores/DelegationStore'
import { MelonTag } from '@models/MelonTag'
import { MelonTodo, MelonUser } from '@models/MelonTodo'
import { SyncArgs, synchronize } from '@nozbe/watermelondb/sync'
import {
  database,
  tagsCollection,
  todosCollection,
  usersCollection,
} from '@utils/wmdb'
import { cloneDeep } from 'lodash'
import { Q } from '@nozbe/watermelondb'
import { TagColumn, TodoColumn } from '@utils/melondb'
import { updateOrCreateDelegation } from '@utils/delegations'
import { RawRecord } from '@nozbe/watermelondb/RawRecord'
import { encrypt, _e } from '@utils/encryption'

type SyncRecord = RawRecord & { updated_at: number }

type SyncType = SyncArgs & {
  conflictResolver: (
    lastSyncDate: Date,
    local: SyncRecord,
    remote: SyncRecord,
    resolved: SyncRecord
  ) => void
}

const wmdbGetLastPullAt =
  require('@nozbe/watermelondb/sync/impl').getLastPulledAt

class Sync {
  socketConnection = new SocketConnection()

  private settingsSyncManager: SyncManager<Settings>
  private userSyncManager: SyncManager<User>
  private heroSyncManager: SyncManager<Hero>
  private delegationSyncManager: SyncManager<any>

  @computed get isSyncing() {
    return (
      this.settingsSyncManager.isSyncing ||
      this.userSyncManager.isSyncing ||
      this.heroSyncManager.isSyncing ||
      this.delegationSyncManager.isSyncing
    )
  }

  @observable gotWmDb = false
  serverTimeStamp: undefined | number
  serverObjects: any

  $promise?: Promise<void>

  wmDbSybcFunc = async () => {
    if (!this.socketConnection.connected) {
      return Promise.reject('Socket sync: not connected to sockets')
    }
    if (!this.socketConnection.authorized) {
      return Promise.reject('Socket sync: not authorized')
    }
    if (!this.socketConnection.token) {
      return Promise.reject('Socket sync: no authorization token provided')
    }
    if (this.gotWmDb || this.$promise) return
    const lastPulledAt = await wmdbGetLastPullAt(database)
    this.socketConnection.socketIO.emit('get_wmdb', new Date(lastPulledAt))
    this.$promise = when(() => this.gotWmDb)
    await this.$promise
    await synchronize({
      sendCreatedAsUpdated: true,
      database,
      pullChanges: async () => {
        return {
          changes: this.serverObjects,
          timestamp: this.serverTimeStamp!,
        }
      },
      pushChanges: async ({ changes, lastPulledAt }) => {
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
      },
      migrationsEnabledAtVersion: 1,
      conflictResolver: (_, local, remote, resolved) => {
        const localDate = new Date(local.updated_at)
        const remoteDate = new Date(remote.updated_at)
        remote.updated_at = Date.now()
        local.updated_at = Date.now()
        //return remote
        return Object.assign(resolved, remoteDate > localDate ? remote : local)
      },
    } as SyncType)
    this.gotWmDb = false
    this.$promise = undefined
  }

  constructor() {
    makeObservable(this)
    this.setupSyncListeners()

    this.socketConnection.socketIO.on('wmdb', this.wmDbSybcFunc)

    this.socketConnection.socketIO.on(
      'return_wmdb',
      async (serverObjects: any, serverTimeStamp: number) => {
        this.serverTimeStamp = serverTimeStamp
        const newS = []
        const newT = []
        for (const updated of serverObjects.tags.updated) {
          const localTodo = (
            await tagsCollection
              .query(Q.where(TagColumn._id, updated.server_id))
              .fetch()
          )[0]
          if (localTodo) {
            updated.id = localTodo.id
            newT.push(updated)
            continue
          }
          updated.id = updated.server_id
          newT.push(updated)
        }
        for (const updated of serverObjects.todos.updated) {
          if (!!updated.delegator_id) {
            updated.user_id = (
              await updateOrCreateDelegation(updated.user_id, false, true)
            ).id
            updated.delegator_id = (
              await updateOrCreateDelegation(updated.delegator_id, true, true)
            ).id
          }
          const localTodo = (
            await todosCollection
              .query(Q.where(TodoColumn._id, updated.server_id))
              .fetch()
          )[0]
          if (localTodo) {
            updated.id = localTodo.id
            newS.push(updated)
            continue
          }
          updated.id = updated.server_id
          updated.exact_date_at = new Date(
            getTitle({
              monthAndYear: updated.month_and_year,
              date: updated.date,
            })
          ).getTime()
          newS.push(updated)
        }
        serverObjects.todos.updated = newS
        serverObjects.tags.updated = newT
        this.serverObjects = serverObjects
        this.gotWmDb = true
      }
    )

    this.socketConnection.socketIO.on(
      'complete_wmdb',
      async (pushedBack?: { todos: MelonTodo[]; tags: MelonTag[] }) => {
        this.serverTimeStamp = undefined
        this.serverObjects = undefined
        if (this.gotWmDb) await when(() => !this.gotWmDb)
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
      }
    )

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
    this.delegationSyncManager = new SyncManager<any>(
      this.socketConnection,
      'delegate',
      () => sharedDelegationStore.updatedAt,
      (objects, pushBack, completeSync) => {
        return onDelegationObjectsFromServer(objects, pushBack, completeSync)
      },
      async (lastSyncDate) => {
        sharedDelegationStore.updatedAt = lastSyncDate
      }
    )
  }

  login = (token: string) => {
    return new Promise<void>(async (res, rej) => {
      try {
        // Main socket connection
        this.socketConnection.token = token
        await this.socketConnection.authorize()
        // Worker socket connection
        await this.sync()
        res()
      } catch (err) {
        rej(err)
      }
    })
  }

  logout = () => {
    this.socketConnection.logout()
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
    if (!hydration) {
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
          this.wmDbSybcFunc(),
          //this.tagsSyncManager.sync(),
          this.delegationSyncManager.sync(),
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
        return this.wmDbSybcFunc()
      case SyncRequestEvent.Tag:
        return this.wmDbSybcFunc()
      case SyncRequestEvent.Delegation:
        return this.delegationSyncManager.sync()
    }
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
}

export const sharedSync = new Sync()
