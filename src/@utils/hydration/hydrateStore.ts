import { sharedSocketStore } from '@stores/SocketStore'
import { alertError } from '@utils/alert'
import { hydratedStores, isHydrated } from '@utils/hydration/hydratedStores'
import { requestSync } from '@utils/sockets/socketEventEmitter'

export function hydrateStore(name: string) {
  hydratedStores[name] = true
  const needsSync = isHydrated()
  if (needsSync) {
    try {
      if (sharedSocketStore.connected && sharedSocketStore.authorized) {
        requestSync()
      }
    } catch (err) {
      alertError(err)
    }
  }
}
