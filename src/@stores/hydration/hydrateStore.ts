import { sharedSync } from '@sync/Sync'
import { hydratedStores, isHydrated } from '@stores/hydration/hydratedStores'
import { requestSync } from '@sync/syncEventEmitter'

export function hydrateStore(name: string) {
  hydratedStores[name] = true
  const needsSync = isHydrated()
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
