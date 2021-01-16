import { WorkerMesage, WorkerMessageType } from '@utils/sockets/WorkerMessage'
import { MainMessage, MainMessageType } from '@utils/sockets/MainMessage'
import { SocketConnection } from '@utils/sockets/SocketConnection'
import { self } from 'react-native-threads'

// TODO: logout logic
// TODO: sync logic of realm objects
// TODO: sync logic of non-realm stores

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
    default:
      break
  }
})
