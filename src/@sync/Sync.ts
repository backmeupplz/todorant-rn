import { sharedTodoStore } from '@stores/TodoStore'
import { sharedTagStore } from '@stores/TagStore'
import { isHydrated } from '@stores/hydration/hydratedStores'
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
import { computed, makeObservable } from 'mobx'
import { Todo } from '@models/Todo'
import { Tag } from '@models/Tag'
import {
  onDelegationObjectsFromServer,
  onTagsObjectsFromServer,
  onTodosObjectsFromServer,
} from '@sync/SyncObjectHandlers'
import { sharedDelegationStore } from '@stores/DelegationStore'

class Sync {
  socketConnection = new SocketConnection()

  private settingsSyncManager: SyncManager<Settings>
  private userSyncManager: SyncManager<User>
  private heroSyncManager: SyncManager<Hero>
  private todoSyncManager: SyncManager<Todo[]>
  private tagsSyncManager: SyncManager<Tag[]>
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

  constructor() {
    makeObservable(this)
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
    this.todoSyncManager = new SyncManager<Todo[]>(
      this.socketConnection,
      'todos',
      () => sharedTodoStore.updatedAt,
      (objects, pushBack, completeSync) => {
        return onTodosObjectsFromServer(
          objects,
          pushBack as () => Promise<Todo[]>,
          completeSync
        )
      },
      async (lastSyncDate) => {
        sharedTodoStore.updatedAt = lastSyncDate
      }
    )
    this.tagsSyncManager = new SyncManager<Tag[]>(
      this.socketConnection,
      'tags',
      () => sharedTagStore.updatedAt,
      (objects, pushBack, completeSync) => {
        return onTagsObjectsFromServer(
          objects,
          pushBack as () => Promise<Tag[]>,
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
        return this.todoSyncManager.sync()
      case SyncRequestEvent.Tag:
        return this.tagsSyncManager.sync()
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
