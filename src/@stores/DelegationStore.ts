import { mobxRealmCollection } from '@utils/mobx-realm/collection'
import { DelegationUser } from '@models/DelegationUser'
import { realm } from '@utils/realm'
import { computed, makeObservable, observable } from 'mobx'

class DelegationStore {
  constructor() {
    makeObservable(this)
  }

  @computed get delegators() {
    return mobxRealmCollection(
      realm.objects(DelegationUser).filtered('isDelegator = true')
    )
  }

  @computed get delegates() {
    return mobxRealmCollection(
      realm.objects(DelegationUser).filtered('isDelegator = false')
    )
  }

  logout() {
    realm.write(() => {
      realm.delete(realm.objects(DelegationUser))
    })
  }
}

export const sharedDelegationStore = new DelegationStore()
