import { observable, computed } from 'mobx'
import { DelegationUser, DelegationUserType } from '@models/DelegationUser'
import { realm } from '@utils/realm'
import { hydrateStore } from '@utils/hydrated'
import { hydrate } from '@utils/hydrate'

class DelegationStore {
  hydrated = false

  @observable allDelegationUsers = realm.objects<DelegationUser>(
    'DelegationUser'
  )

  @computed get delegators() {
    return this.allDelegationUsers.filtered(
      `delegationType = "${DelegationUserType.delegator}"`
    )
  }

  @computed get delegates() {
    return this.allDelegationUsers.filtered(
      `delegationType = "${DelegationUserType.delegate}"`
    )
  }

  onObjectsFromServer = async (objects: any) => {
    if (!this.hydrated) {
      return
    }
    // Remove all
    realm.write(() => {
      realm.delete(this.allDelegationUsers)
    })
    // Sync delegates
    realm.write(() => {
      for (const delegate of objects.delegates) {
        realm.create('DelegationUser', {
          ...delegate,
          delegationType: DelegationUserType.delegate,
        })
      }
    })
    // Sync delegators
    realm.write(() => {
      for (const delegator of objects.delegators) {
        realm.create('DelegationUser', {
          ...delegator,
          delegationType: DelegationUserType.delegator,
        })
      }
    })
    // Refresh
    this.refreshDelegationUsers()
  }

  refreshDelegationUsers = () => {
    this.allDelegationUsers = realm.objects<DelegationUser>('DelegationUser')
  }
}

export const sharedDelegationStore = new DelegationStore()
hydrate('DelegationStore', sharedDelegationStore).then(async () => {
  sharedDelegationStore.hydrated = true
  hydrateStore('DelegationStore')
})
