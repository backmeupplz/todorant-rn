export const hydratedStores = {
  SettingsStore: false,
  HeroStore: false,
  SessionStore: false,
  TodoStore: false,
  TagStore: false,
} as { [index: string]: boolean }

export function isHydrated() {
  return Object.keys(hydratedStores).reduce(
    (prev, cur) => (!hydratedStores[cur] ? false : prev),
    true
  )
}