import { MobxRealmModel } from '@utils/mobx-realm/model'

export enum DelegationUserType {
  delegate = 'delegate',
  delegator = 'delegator',
}

export class DelegationUser extends MobxRealmModel {
  public static schema = {
    name: 'DelegationUser',
    properties: {
      _id: { type: 'string', indexed: true },
      name: { type: 'string', indexed: true },
      delegationType: { type: 'string', indexed: true },
    },
  }

  objectSchema() {
    return DelegationUser.schema
  }

  _id!: string
  name!: string
  delegationType!: DelegationUserType
}
