import { Q } from '@nozbe/watermelondb'
import { UserColumn } from '@utils/melondb'
import { usersCollection } from '@utils/wmdb'
import { makeObservable, observable } from 'mobx'
import { persist } from 'mobx-persist'
import { hydrate } from './hydration/hydrate'
import { hydrateStore } from './hydration/hydrateStore'

class DelegationStore {
  hydrated = false

  @persist('date') @observable lastSyncDate?: Date
  @persist('date') @observable updatedAt?: Date

  @observable delegatesCount = 0
  @observable delegatorsCount = 0

  delegates = usersCollection.query(Q.where(UserColumn.isDelegator, false))
  delegators = usersCollection.query(Q.where(UserColumn.isDelegator, true))

  constructor() {
    makeObservable(this)
    this.delegates
      .observeCount(false)
      .subscribe((count) => (this.delegatesCount = count))
    this.delegators
      .observeCount(false)
      .subscribe((count) => (this.delegatorsCount = count))
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
