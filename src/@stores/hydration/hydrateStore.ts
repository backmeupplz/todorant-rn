import { hydration } from '@stores/hydration/hydratedStores'
import { sharedSync } from '@sync/Sync'
import { requestSync } from '@sync/syncEventEmitter'

export function hydrateStore(name: string) {
  hydration.hydratedStores[name] = true
  const needsSync = hydration.isHydrated
  if (needsSync) {
    try {
      if (
        sharedSync.socketConnection.connected &&
        sharedSync.socketConnection.authorized
      ) {
        requestSync()
      }
    } catch (err) {
      // Do nothing
    }
  }
}
