import { observable } from 'mobx'
import Realm from 'realm'

export enum DelegationUserType {
  delegate = 'delegate',
  delegator = 'delegator',
}

export class DelegationUser extends Realm.Object {
  public static schema = {
    name: 'DelegationUser',
    properties: {
      _id: { type: 'string', indexed: true },
      name: { type: 'string', indexed: true },
      delegationType: { type: 'string', indexed: true },
    },
  }

  @observable _id!: string
  @observable name!: string
  @observable delegationType!: DelegationUserType
}
