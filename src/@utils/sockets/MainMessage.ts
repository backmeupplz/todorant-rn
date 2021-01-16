export enum MainMessageType {
  AuthorizationRequest = 'AuthorizationRequest',
}

export interface MainMessage {
  type: MainMessageType
  // AuthorizationRequest
  token?: string
}
