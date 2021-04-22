import { MobxRealmModel } from '@utils/mobx-realm/model'

export enum DelegationUserType {
  delegate = 'delegate',
  delegator = 'delegator',
}

export class DelegationUserInTodo extends MobxRealmModel {
  public static schema = {
    name: 'DelegationUserInTodo',
    properties: {
      _id: { type: 'string', indexed: true },
      name: { type: 'string', indexed: true },
    },
  }

  objectSchema() {
    return DelegationUserInTodo.schema
  }

  _id!: string
  name!: string
}

export class DelegationUser extends MobxRealmModel {
  public static schema = {
    name: 'DelegationUser',
    properties: {
      ...DelegationUserInTodo.schema.properties,
      isDelegator: 'bool',
    },
  }

  objectSchema() {
    return DelegationUser.schema
  }

  _id!: string
  name!: string
  isDelegator!: boolean
}
