import { makeObservable, observable } from 'mobx'
import { persist } from 'mobx-persist'
import { hydrate } from './hydration/hydrate'
import { hydrateStore } from './hydration/hydrateStore'

class DelegationStore {
  hydrated = false

  @persist('date') @observable lastSyncDate?: Date
  @persist('date') @observable updatedAt?: Date

  constructor() {
    makeObservable(this)
  }

  logout() {
    this.updatedAt = undefined
  }
}

export const sharedDelegationStore = new DelegationStore()
hydrate('DelegationStore', sharedDelegationStore).then(async () => {
  sharedDelegationStore.hydrated = true
  hydrateStore('DelegationStore')
})
