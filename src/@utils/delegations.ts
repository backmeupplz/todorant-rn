import { DelegationUser } from '@models/DelegationUser'
import { Results } from 'realm'
import { realm } from './realm'

export function removeDelegation(
  delegation: DelegationUser,
  delegator: boolean
) {
  const localDelegation = getLocalDelegation(delegation, delegator)
  if (!localDelegation) {
    console.error('Local delegation not found')
    return
  }
  localDelegation.deleted = true
  localDelegation.updatedAt = new Date()
}

export function getLocalDelegation(
  delegation: DelegationUser,
  delegator: boolean
) {
  const delegationIdPredicate = `_id = "${delegation._id}"`
  const delegationTokenPredicate = `delegateInviteToken = "${delegation.delegateInviteToken}"`
  let delegations = realm.objects(DelegationUser)
  let predicateToSearch: string = `(${delegationIdPredicate} || ${delegationTokenPredicate})`
  return delegations.filtered(
    `isDelegator = ${delegator} && ${predicateToSearch}`
  )[0]
}

// Should be placed inside of realm.write
export function removeMismatchesWithServer(
  localDelegations: DelegationUser[] | Results<DelegationUser>,
  serverDelegations: DelegationUser[]
) {
  localDelegations.forEach((localDelegation) => {
    if (
      localDelegation &&
      !serverDelegations.find(
        (delegation) => delegation._id === localDelegation._id
      )
    ) {
      realm.delete(localDelegation)
    }
  })
}

export function updateOrCreateDelegation(
  delegation: DelegationUser,
  delegator: boolean
) {
  const localDelegate = getLocalDelegation(delegation, delegator)
  if (localDelegate) {
    Object.assign(localDelegate, delegation)
    localDelegate.updatedAt = new Date()
  } else
    realm.create(DelegationUser, {
      ...delegation,
      isDelegator: delegator,
      deleted: false,
      updatedAt: new Date(),
    } as DelegationUser)
}

export function cloneDelegation(delegation: DelegationUser) {
  return {
    _id: delegation._id,
    name: delegation.name,
    updatedAt: delegation.updatedAt,
    delegateInviteToken: delegation.delegateInviteToken,
    deleted: delegation.deleted,
  } as DelegationUser
}
