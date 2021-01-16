import { MainMessage, MainMessageType } from '@utils/sockets/MainMessage'
import { SocketConnection } from '@utils/sockets/SocketConnection'
import { WorkerMesage, WorkerMessageType } from '@utils/sockets/WorkerMessage'
import { Thread } from 'react-native-threads'

const syncWorker = new Thread(`./SyncWorker.js`)

class SocketManager {
  private socketConnection = new SocketConnection()
  private pendingAuthorizations: {
    res?: () => void
    rej?: (reason: string) => void
  }[] = []

  constructor() {
    this.setupWorkerListeners()
  }

  login = (token: string) => {
    return new Promise<void>(async (res, rej) => {
      // Main socket connection
      this.socketConnection.token = token
      await this.socketConnection.authorize()
      // Worker socket connection
      this.pendingAuthorizations.push({ res, rej })
      this.sendMessageToWorker({
        type: MainMessageType.AuthorizationRequest,
        token: token,
      })
    })
  }

  logout = () => {
    this.socketConnection.logout()
    syncWorker.sendMessage({
      name: MainMessageType.LogoutRequest,
    })
  }

  private setupWorkerListeners() {
    syncWorker.onmessage = (message: WorkerMesage) => {
      switch (message.type) {
        case WorkerMessageType.AuthorizationCompleted:
          this.authorizationCompleted(message.error)
          break
        default:
          break
      }
    }
  }

  private authorizationCompleted(error?: string) {
    this.pendingAuthorizations.forEach((authorization) => {
      if (error && authorization.rej) {
        authorization.rej(error)
      } else if (!error && authorization.res) {
        authorization.res()
      }
    })
    this.pendingAuthorizations = []
  }

  private sendMessageToWorker(message: MainMessage) {
    syncWorker.postMessage(message)
  }
}

export const sockets = new SocketManager()
