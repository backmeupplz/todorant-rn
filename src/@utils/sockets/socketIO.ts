import SocketIO from 'socket.io-client'

export const socketIO = SocketIO(
  __DEV__ ? 'http://localhost:3000' : 'https://ws.todorant.com'
)
