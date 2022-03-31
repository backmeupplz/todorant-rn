import { EventEmitter } from 'events'
import { SyncRequestEvent } from '@sync/SyncRequestEvent'
import { sharedSync } from 'src/@sync/Sync'

export const syncEventEmitter = new EventEmitter()

export function requestSync(requestEvent = SyncRequestEvent.All) {
  syncEventEmitter.emit(requestEvent)
}
