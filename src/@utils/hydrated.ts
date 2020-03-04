import { sockets } from '@utils/sockets'
const hydratedStores = {
  TodoStore: false,
  SettingsStore: false,
} as { [index: string]: boolean }

export function hydrateStore(name: string) {
  hydratedStores[name] = true
  const needsSync = Object.keys(hydratedStores).reduce(
    (prev, cur) => (!cur ? false : prev),
    true
  )
  if (needsSync) {
    sockets.globalSync()
  }
}
