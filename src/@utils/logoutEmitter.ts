import { EventEmitter } from 'events'

export const LogoutEvent = 'logout'

export const logoutEventEmitter = new EventEmitter()

export function requestLogout() {
  logoutEventEmitter.emit(LogoutEvent)
}
