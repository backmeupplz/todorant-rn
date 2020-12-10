import { PromiseMap } from '@utils/sockets/PromiseMap'

const timeouts = {
  syncRequested: 30,
} as { [index: string]: number }
const pushingObjectsTimeout = 60

export enum PromiseMapType {
  pendingSyncs = 'pendingSyncs',
  pendingPushes = 'pendingPushes',
}

export function checkPromiseMapForTimeout(
  promiseMap: PromiseMap,
  type = PromiseMapType.pendingSyncs
) {
  for (const syncId in promiseMap) {
    const value = promiseMap[syncId]
    let timeout: number
    if (type === PromiseMapType.pendingSyncs) {
      if (!value.syncStage) {
        continue
      }
      timeout = timeouts[value.syncStage]
    } else {
      timeout = pushingObjectsTimeout
    }
    if (!timeout) {
      continue
    }
    if (Date.now() - value.createdAt > timeout * 1000) {
      value.rej('Operation timed out')
    }
  }
}
