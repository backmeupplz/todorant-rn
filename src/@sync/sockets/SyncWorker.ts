import { WorkerMesage, WorkerMessageType } from '@sync/WorkerMessage'
import { MainMessage, MainMessageType } from '@sync/MainMessage'
import { SocketConnection } from '@sync/sockets/SocketConnection'
import { self } from 'react-native-threads'

// TODO: sync logic of realm objects

class SyncWorker {
  private socketConnection = new SocketConnection()

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

  private sendMessageToMain(message: WorkerMesage) {
    self.postMessage(message)
  }
}

const syncWorker = new SyncWorker()

self.onMessage((event: MainMessage) => {
  switch (event.type) {
    case MainMessageType.AuthorizationRequest:
      syncWorker.authorize(event.token)
      break
    case MainMessageType.LogoutRequest:
      syncWorker.logout()
      break
    default:
      break
  }
})
