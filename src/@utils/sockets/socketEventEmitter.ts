import { EventEmitter } from 'events'

export enum SyncRequestEvent {
  All = 'requestSync.all',
  Todo = 'requestSync.todo',
  Tag = 'requestSync.tag',
  Settings = 'requestSync.settings',
  User = 'requestSync.user',
  Hero = 'requestSync.hero',
  Delegation = 'requestSync.delegation',
}

export const socketEventEmitter = new EventEmitter()

export function requestSync(requestEvent = SyncRequestEvent.All) {
  socketEventEmitter.emit(requestEvent)
}
