import { sockets } from '@utils/sockets'

const hydratedStores = {
  TodoStore: false,
  TagStore: false,
  SettingsStore: false,
  HeroStore: false,
  SessionStore: false,
} as { [index: string]: boolean }

export function isHydrated() {
  return Object.keys(hydratedStores).reduce(
    (prev, cur) => (!hydratedStores[cur] ? false : prev),
    true
  )
}

export function hydrateStore(name: string) {
  hydratedStores[name] = true
  const needsSync = isHydrated()
  if (needsSync) {
    sockets.globalSync()
  }
}
