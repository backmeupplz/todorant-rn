export enum MainMessageType {
  AuthorizationRequest = 'AuthorizationRequest',
  LogoutRequest = 'LogoutRequest',
}

export interface MainMessage {
  type: MainMessageType
  // AuthorizationRequest
  token?: string
}
