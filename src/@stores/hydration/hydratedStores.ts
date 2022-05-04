import { computed, makeObservable, observable } from 'mobx'

class Hydration {
  constructor() {
    makeObservable(this)
  }

  @observable hydratedStores = {
    SettingsStore: false,
    HeroStore: false,
    SessionStore: false,
    TodoStore: false,
    TagStore: false,
    OnboardingStore: false,
    DelegationStore: false,
  } as { [index: string]: boolean }

  @computed get isHydrated() {
    return Object.keys(this.hydratedStores).reduce(
      (prev, cur) => (!this.hydratedStores[cur] ? false : prev),
      true
    )
  }
}

export const hydration = new Hydration()
