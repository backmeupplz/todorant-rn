export const hydratedStores = {
  TodoStore: false,
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
