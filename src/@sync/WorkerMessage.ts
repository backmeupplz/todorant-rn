export enum WorkerMessageType {
  AuthorizationCompleted = 'AuthorizationCompleted',
  SyncCompleted = 'SyncCompleted',
}

export interface WorkerMesage {
  type: WorkerMessageType
  // AuthorizationCompleted, SyncCompleted
  error?: string
  // SyncCompleted
  syncId?: string
}
