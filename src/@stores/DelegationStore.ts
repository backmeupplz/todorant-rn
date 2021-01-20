import { mobxRealmCollection } from '@utils/mobx-realm/collection'
import { DelegationUser, DelegationUserType } from '@models/DelegationUser'
import { realm } from '@utils/realm'
import { makeObservable, observable } from 'mobx'

class DelegationStore {
  constructor() {
    makeObservable(this)
  }

  @observable delegators = mobxRealmCollection(
    realm
      .objects<DelegationUser>('DelegationUser')
      .filtered(`delegationType = "${DelegationUserType.delegator}"`)
  )

  @observable delegates = mobxRealmCollection(
    realm
      .objects<DelegationUser>('DelegationUser')
      .filtered(`delegationType = "${DelegationUserType.delegate}"`)
  )

  logout() {
    realm.write(() => {
      realm.delete(realm.objects<DelegationUser>('DelegationUser'))
    })
  }
}

export const sharedDelegationStore = new DelegationStore()
