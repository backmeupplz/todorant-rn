import { sharedSocketStore } from '@stores/SocketStore'
import { alertError } from '@utils/alert'
import { hydratedStores, isHydrated } from '@stores/hydration/hydratedStores'
import { requestSync } from '@sync/syncEventEmitter'

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
