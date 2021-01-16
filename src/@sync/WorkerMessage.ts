export enum WorkerMessageType {
  AuthorizationCompleted = 'AuthorizationCompleted',
}

export interface WorkerMesage {
  type: WorkerMessageType
  // AuthorizationCompleted
  error?: string
}
