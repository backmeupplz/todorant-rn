import { DelegationUser } from '@models/DelegationUser'
import { MelonUser } from '@models/MelonTodo'
import { Q } from '@nozbe/watermelondb'
import { Results } from 'realm'
import { realm } from './realm'
import { usersCollection } from './wmdb'

export async function removeDelegation(
  delegation: MelonUser,
  delegator: boolean
) {
  const localDelegation = await getLocalDelegation(delegation, delegator)
  if (!localDelegation) {
    console.error('Local delegation not found')
    return
  }
  return localDelegation.prepareUpdate(
    (delegation) => (delegation.deleted = true)
  )
}

export async function getLocalDelegation(
  delegation: MelonUser,
  delegator: boolean
) {
  return (
    await usersCollection
      .query(
        Q.where('is_delegator', delegator),
        Q.or(
          Q.where('server_id', delegation._id),
          Q.where('delegate_invite_token', delegation.delegateInviteToken)
        )
      )
      .fetch()
  )[0]
}

// Should be placed inside of realm.write
export function getMismatchesWithServer(
  localDelegations: MelonUser[] | Results<MelonUser>,
  serverDelegations: MelonUser[]
) {
  const missMatches = [] as MelonUser[]
  localDelegations.forEach((localDelegation) => {
    if (
      localDelegation &&
      !serverDelegations.find(
        (delegation) => delegation._id === localDelegation._id
      )
    ) {
      missMatches.push(localDelegation.prepareMarkAsDeleted())
    }
  })
  return missMatches
}

export async function updateOrCreateDelegation(
  delegation: MelonUser,
  delegator: boolean
) {
  const localDelegate = await getLocalDelegation(delegation, delegator)
  if (localDelegate) {
    return localDelegate.prepareUpdate((delegate) =>
      Object.assign(delegate, delegation)
    )
  } else
    return usersCollection.prepareCreate((delegate) => {
      Object.assign(delegate, delegation)
      delegate.isDelegator = delegator
    })
}

export function cloneDelegation(delegation: MelonUser) {
  return {
    _id: delegation._id,
    name: delegation.name,
    updatedAt: delegation.updatedAt,
    delegateInviteToken: delegation.delegateInviteToken,
    deleted: delegation.deleted,
  } as MelonUser
}
