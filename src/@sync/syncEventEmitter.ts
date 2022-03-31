import { EventEmitter } from 'events'
import { SyncRequestEvent } from '@sync/SyncRequestEvent'

export const syncEventEmitter = new EventEmitter()

export function requestSync(requestEvent = SyncRequestEvent.All) {
  syncEventEmitter.emit(requestEvent)
}
