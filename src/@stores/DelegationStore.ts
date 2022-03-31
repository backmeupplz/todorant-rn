import { Q } from '@nozbe/watermelondb'
import { UserColumn } from '@utils/watermelondb/tables'
import { hydrate } from '@stores/hydration/hydrate'
import { hydrateStore } from '@stores/hydration/hydrateStore'
import { makeObservable, observable } from 'mobx'
import { persist } from 'mobx-persist'
import { usersCollection } from '@utils/watermelondb/wmdb'

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
      .subscribe((count) => (this.delegatesCount = count - 1))
    this.delegators
      .observeCount(false)
      .subscribe((count) => (this.delegatorsCount = count - 1))
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
