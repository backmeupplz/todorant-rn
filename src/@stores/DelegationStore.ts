import { mobxRealmCollection } from '@utils/mobx-realm/collection'
import { DelegationUser } from '@models/DelegationUser'
import { realm } from '@utils/realm'
import { computed, makeObservable, observable } from 'mobx'
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

  @computed get delegators() {
    return mobxRealmCollection(
      realm
        .objects(DelegationUser)
        .filtered('deleted = false')
        .filtered('isDelegator = true')
    )
  }

  @computed get delegates() {
    return mobxRealmCollection(
      realm
        .objects(DelegationUser)
        .filtered('deleted = false')
        .filtered('isDelegator = false')
    )
  }

  logout() {
    this.updatedAt = undefined
    realm.write(() => {
      realm.delete(realm.objects(DelegationUser))
    })
  }
}

export const sharedDelegationStore = new DelegationStore()
hydrate('DelegationStore', sharedDelegationStore).then(async () => {
  sharedDelegationStore.hydrated = true
  hydrateStore('DelegationStore')
})
