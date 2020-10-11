import { observable, computed } from 'mobx'
import { DelegationUser, DelegationUserType } from '@models/DelegationUser'
import { realm } from '@utils/realm'

class DelegationStore {
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
