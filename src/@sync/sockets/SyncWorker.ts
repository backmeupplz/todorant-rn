import { Tag } from '@models/Tag'
import { SyncRequestEvent } from '@sync/SyncRequestEvent'
import { SyncManager } from '@sync/SyncManager'
import { WorkerMesage, WorkerMessageType } from '@sync/WorkerMessage'
import { MainMessage, MainMessageType } from '@sync/MainMessage'
import { SocketConnection } from '@sync/sockets/SocketConnection'
import { self } from 'react-native-threads'
import {
  getLastSyncDate,
  LastSyncDateType,
  onDelegationObjectsFromServer,
  onTagsObjectsFromServer,
  onTodosObjectsFromServer,
  updateLastSyncDate,
} from '@sync/SyncObjectHandlers'
import { Todo } from '@models/Todo'

class SyncWorker {
  private socketConnection = new SocketConnection()

  private todoSyncManager: SyncManager<Todo[]>
  private tagsSyncManager: SyncManager<Tag[]>
  private delegationSyncManager: SyncManager<any>

  constructor() {
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
    this.delegationSyncManager = new SyncManager<any>(
      this.socketConnection,
      'delegate',
      () => Promise.resolve(undefined),
      (objects, _, completeSync) => {
        return onDelegationObjectsFromServer(objects, completeSync)
      }
    )
  }

  async authorize(token?: string) {
    this.socketConnection.token = token
    try {
      await this.socketConnection.authorize()
      this.sendMessageToMain({
        type: WorkerMessageType.AuthorizationCompleted,
      })
    } catch (error) {
      this.sendMessageToMain({
        type: WorkerMessageType.AuthorizationCompleted,
        error: error.message,
      })
    }
  }

  logout() {
    this.socketConnection.logout()
  }

  async sync(message: MainMessage) {
    if (!message.syncRequestEvent || !message.syncId) {
      return
    }
    try {
      switch (message.syncRequestEvent) {
        case SyncRequestEvent.Todo:
          await this.todoSyncManager.sync()
          break
        case SyncRequestEvent.Tag:
          await this.tagsSyncManager.sync()
          break
        case SyncRequestEvent.Delegation:
          await this.delegationSyncManager.sync()
          break
        default:
          break
      }
      this.sendMessageToMain({
        type: WorkerMessageType.SyncCompleted,
        syncId: message.syncId,
      })
    } catch (err) {
      this.sendMessageToMain({
        type: WorkerMessageType.SyncCompleted,
        error: err.message,
        syncId: message.syncId,
      })
    }
  }

  private sendMessageToMain(message: WorkerMesage) {
    self.postMessage(JSON.stringify(message))
  }
}

const syncWorker = new SyncWorker()

self.onMessage((message: string) => {
  const parsedMessage = JSON.parse(message) as MainMessage
  switch (parsedMessage.type) {
    case MainMessageType.AuthorizationRequest:
      syncWorker.authorize(parsedMessage.token)
      break
    case MainMessageType.LogoutRequest:
      syncWorker.logout()
      break
    case MainMessageType.SyncRequest:
      syncWorker.sync(parsedMessage)
      break
    default:
      break
  }
})
