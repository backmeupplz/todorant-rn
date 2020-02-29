import { alertError } from '@utils/alert'
import { Todo } from '@models/Todo'
import { sharedTodoStore } from '@stores/TodoStore'
import { sharedSocketStore } from './../@stores/SocketStore'
import SocketIO from 'socket.io-client'
import { sharedSessionStore } from '@stores/SessionStore'
import uuid from 'uuid'
import { Toast } from 'native-base'

const socketIO = SocketIO(
  __DEV__ ? 'http://10.0.2.2:3000' : 'https://ws.todorant.com'
)

class SocketManager {
  pendingPushes = {} as { [index: string]: { res: Function; rej: Function } }

  constructor() {
    this.connect()

    socketIO.on('connect', this.onConnect)
    socketIO.on('disconnect', this.onDisconnect)

    socketIO.on('connect_error', this.onConnectError)
    socketIO.on('connect_timeout', this.onConnectTimeout)
    socketIO.on('error', this.onError)

    socketIO.on('authorized', this.onAuthorized)
    socketIO.on('todos', this.onTodos)
    socketIO.on('todos_pushed', this.onTodosPushed)
    socketIO.on('todos_pushed_error', this.onTodosPushedError)
    socketIO.on('sync_request', this.onSyncRequest)
  }

  connect = () => {
    if (socketIO.connected) {
      return
    }
    socketIO.connect()
  }
  authorize = () => {
    if (
      !sharedSessionStore.user?.token ||
      !socketIO.connected ||
      sharedSocketStore.authorized
    ) {
      return
    }
    socketIO.emit('authorize', sharedSessionStore.user.token)
  }
  logout = () => {
    if (!socketIO.connected) {
      return
    }
    socketIO.emit('logout')
    sharedSocketStore.authorized = false
  }

  onConnect = () => {
    sharedSocketStore.connected = true
    sharedSocketStore.connectionError = undefined
    this.authorize()
  }
  onDisconnect = () => {
    sharedSocketStore.connected = false
    sharedSocketStore.authorized = false
  }

  onConnectError = (error: Error) => {
    sharedSocketStore.connectionError = error
  }
  onConnectTimeout = () => {
    console.warn('ws connect timeout')
  }
  onError = () => {
    console.warn('ws error')
  }

  onAuthorized = () => {
    sharedSocketStore.authorized = true
    this.sync()
  }
  onTodos = async (todos: Todo[]) => {
    if (__DEV__) {
      Toast.show({ text: `Todos received ${todos.length}` })
    }
    try {
      await sharedTodoStore.onTodos(todos)
    } catch (err) {
      alertError(err)
    }
  }

  sync = () => {
    if (!sharedSessionStore.user?.token || !socketIO.connected) {
      return
    }
    if (__DEV__) {
      Toast.show({
        text: `Sync requested ${sharedTodoStore.lastSyncDate}`,
        buttonText: 'Okay',
      })
    }
    socketIO.emit('sync', sharedTodoStore.lastSyncDate)
  }

  pushTodos = (todos: Todo[]): Promise<Todo[]> => {
    return new Promise<Todo[]>((res, rej) => {
      const pushId = uuid()
      this.pendingPushes[pushId] = { res, rej }
      socketIO.emit('push', pushId, todos)
    })
  }

  onTodosPushed = (pushId: string, todos: Todo[]) => {
    this.pendingPushes[pushId]?.res(todos)
  }

  onTodosPushedError = (pushId: string, error: Error) => {
    this.pendingPushes[pushId]?.rej(error)
  }
  onSyncRequest = () => {
    this.sync()
  }
}

export const sockets = new SocketManager()
