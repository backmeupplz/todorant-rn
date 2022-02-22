import { MelonUser } from '@models/MelonTodo'
import { Q } from '@nozbe/watermelondb'
import { sharedSessionStore } from '@stores/SessionStore'
import { Falsy } from 'react-native'
import { TodoColumn, UserColumn } from './watermelondb/tables'
import { database, todosCollection, usersCollection } from './watermelondb/wmdb'
import { sharedSync } from '@sync/Sync'
import { SyncRequestEvent } from '@sync/SyncRequestEvent'

export async function removeDelegation(
  delegation: Partial<MelonUser>,
  delegator: boolean,
  forceWrite = false,
  description: string
) {
  const localDelegation = await getLocalDelegation(delegation, delegator)
  if (!localDelegation) {
    console.error('Local delegation not found')
    return
  }
  const todosWithDelegate = await todosCollection
    .query(
      Q.where(
        delegator ? TodoColumn.delegator : TodoColumn.user,
        localDelegation.id
      )
    )
    .fetch()
  await Promise.all(
    todosWithDelegate.map(async (todo) => {
      await database.write(async () => {
        await todo.updateWithDescription((todo) => {
          todo.deleted = true
          todo.delegateAccepted = true
          if (delegator) {
            todo.delegator?.set(null)
          }
        }, 'removing delegator from todos and mark them as deleted')
      })
    })
  )
  if (forceWrite) return await localDelegation.delete(description)
  return localDelegation
}

export async function getLocalDelegation(
  delegation: Partial<MelonUser>,
  delegator: boolean
): Promise<MelonUser | Falsy> {
  if (!delegation) {
    return null
  }
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
  const uniqueLocalDelegations = new Set(localDelegations)
  const missMatches = [] as MelonUser[]
  uniqueLocalDelegations.forEach((localDelegation) => {
    if (
      localDelegation &&
      !serverDelegations.find(
        (delegation) => delegation._id === localDelegation._id
      )
    ) {
      missMatches.push(localDelegation)
    }
  })
  return missMatches
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
