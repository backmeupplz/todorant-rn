import { hydration } from '@stores/hydration/hydratedStores'

export function hydrateStore(name: string) {
  hydration.hydratedStores[name] = true
  //const needsSync = hydration.isHydrated
  //if () {
  if (false) {
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
