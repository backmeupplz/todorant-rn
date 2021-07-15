import { DelegationUser } from '@models/DelegationUser'
import { MelonUser } from '@models/MelonTodo'
import { Q } from '@nozbe/watermelondb'
import { UserColumn } from './melondb'
import { database, usersCollection } from './wmdb'

export async function getOrCreateDelegation(
  delegation: MelonUser,
  delegator: boolean
) {
  const localUser = await getLocalDelegation(delegation, delegator)
  if (localUser) {
  }
}

export async function removeDelegation(
  delegation: MelonUser,
  delegator: boolean,
  forceWrite = false
) {
  const localDelegation = await getLocalDelegation(delegation, delegator)
  if (!localDelegation) {
    console.error('Local delegation not found')
    return
  }
  if (forceWrite) return await localDelegation.delete()
  return localDelegation.prepareUpdate(
    (delegation) => (delegation.deleted = true)
  )
}

export async function getLocalDelegation(
  delegation: MelonUser,
  delegator: boolean
): Promise<MelonUser | undefined> {
  return (
    await usersCollection
      .query(
        Q.where(UserColumn.isDelegator, delegator),
        Q.or(
          Q.where(UserColumn._id, delegation._id || null),
          Q.where(
            UserColumn.delegateInviteToken,
            delegation.delegateInviteToken || null
          )
        )
      )
      .fetch()
  )[0]
}

// Should be placed inside of realm.write
export function getMismatchesWithServer(
  localDelegations: MelonUser[],
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
  delegator: boolean,
  forceWrite = false
) {
  // Get local user if exists
  const localDelegate = await getLocalDelegation(delegation, delegator)
  if (localDelegate) {
    if (forceWrite) {
      const updatedUser = localDelegate.updateUser(localDelegate)
      return updatedUser
    }
    return localDelegate.prepareUpdate((delegate) =>
      Object.assign(delegate, delegation)
    )
  }
  // Create new user in place if need
  if (forceWrite) {
    let createdUser!: MelonUser
    await database.write(async () => {
      createdUser = await usersCollection.create((delegate) => {
        Object.assign(delegate, delegation)
        delegate.isDelegator = delegator
      })
    })
    return createdUser || undefined
  }
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
