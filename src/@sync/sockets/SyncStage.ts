export enum SyncStage {
  syncRequested = 'syncRequested',
  gotObjectsFromServer = 'gotObjectsFromServer',
  pushingObjectsToServer = 'pushingObjectsToServer',
  gotPushedBackObjectsFromServer = 'gotPushedBackObjectsFromServer',
}
