import { EventEmitter } from 'events'
import { SyncRequestEvent } from '@utils/sockets/SyncRequestEvent'

export const socketEventEmitter = new EventEmitter()

export function requestSync(requestEvent = SyncRequestEvent.All) {
  socketEventEmitter.emit(requestEvent)
}
