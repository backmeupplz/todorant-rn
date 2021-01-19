import { SyncRequestEvent } from '@sync/SyncRequestEvent'

export enum MainMessageType {
  AuthorizationRequest = 'AuthorizationRequest',
  LogoutRequest = 'LogoutRequest',
  SyncRequest = 'SyncRequest',
}

export interface MainMessage {
  type: MainMessageType
  // AuthorizationRequest
  token?: string
  // SyncRequest
  syncRequestEvent?: SyncRequestEvent
  syncId?: string
}
