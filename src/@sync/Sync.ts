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
import { getTitle, Todo } from '@models/Todo'
import { Tag } from '@models/Tag'
import {
  onDelegationObjectsFromServer,
  onTagsObjectsFromServer,
  onTodosObjectsFromServer,
} from '@sync/SyncObjectHandlers'
import { sharedDelegationStore } from '@stores/DelegationStore'
import { MelonTag } from '@models/MelonTag'
import { MelonTodo } from '@models/MelonTodo'
import { synchronize } from '@nozbe/watermelondb/sync'
import { database, todosCollection } from '@utils/wmdb'
import { v4 } from 'uuid'

import 'react-native-reanimated'
import { spawnThread } from 'react-native-multithreading'
import { debounce } from 'lodash'
import { Q } from '@nozbe/watermelondb'
import { TodoColumn } from '@utils/melondb'
import { updateOrCreateDelegation } from '@utils/delegations'

const wmdbGetLastPullAt =
  require('@nozbe/watermelondb/sync/impl').getLastPulledAt

class Sync {
  socketConnection = new SocketConnection()

  private settingsSyncManager: SyncManager<Settings>
  private userSyncManager: SyncManager<User>
  private heroSyncManager: SyncManager<Hero>
  private todoSyncManager: SyncManager<MelonTodo[]>
  private tagsSyncManager: SyncManager<MelonTag[]>
  private delegationSyncManager: SyncManager<any>

  @computed get isSyncing() {
    return (
      this.settingsSyncManager.isSyncing ||
      this.userSyncManager.isSyncing ||
      this.heroSyncManager.isSyncing ||
      this.todoSyncManager.isSyncing ||
      this.tagsSyncManager.isSyncing ||
      this.delegationSyncManager.isSyncing
    )
  }

  @observable gotWmDb = false
  serverTimeStamp: undefined | number
  serverObjects: any

  $promise: any

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
        this.socketConnection.socketIO.emit('push_wmdb', changes, lastPulledAt)
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
    })
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
          updated._exactDate = updated.monthAndYear
            ? new Date(getTitle(updated))
            : new Date()
          newS.push(updated)
        }
        serverObjects.todos.updated = newS
        this.serverObjects = serverObjects
        this.gotWmDb = true
      }
    )

    this.socketConnection.socketIO.on(
      'complete_wmdb',
      async (pushedBack?: MelonTodo[]) => {
        this.serverTimeStamp = undefined
        this.serverObjects = undefined
        if (this.gotWmDb) await when(() => !this.gotWmDb)
        if (pushedBack && pushedBack.length) {
          for (const todo of pushedBack) {
            const localTodo = await todosCollection.find(todo._tempSyncId)
            if (!localTodo || !todo._id) {
              return
            }
            await localTodo.setServerId(todo._id)
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
    this.todoSyncManager = new SyncManager<MelonTodo[]>(
      this.socketConnection,
      'todos',
      () => sharedTodoStore.updatedAt,
      (objects, pushBack, completeSync) =>
        onTodosObjectsFromServer(
          objects,
          pushBack as () => Promise<MelonTodo[]>,
          completeSync
        ),
      async (lastSyncDate) => {
        sharedTodoStore.updatedAt = lastSyncDate
      }
    )
    this.tagsSyncManager = new SyncManager<MelonTag[]>(
      this.socketConnection,
      'tags',
      () => sharedTagStore.updatedAt,
      (objects, pushBack, completeSync) => {
        return onTagsObjectsFromServer(
          objects,
          pushBack as () => Promise<MelonTag[]>,
          completeSync
        )
      },
      async (lastSyncDate) => {
        sharedTagStore.updatedAt = lastSyncDate
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
          //this.delegationSyncManager.sync(),
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
      // return this.tagsSyncManager.sync()
      case SyncRequestEvent.Delegation:
      // return this.delegationSyncManager.sync()
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
