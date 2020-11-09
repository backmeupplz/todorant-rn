import { mobxRealmObject } from '@utils/mobx-realm/object'
import { observable } from 'mobx'
import Realm from 'realm'

export function mobxRealmCollection<T>(
  realmCollection: Realm.Results<T & Realm.Object>
) {
  const observableArray = observable.array<T & Realm.Object>()
  realmCollection.forEach((realmObject) => {
    observableArray.push(mobxRealmObject(realmObject))
  })

  realmCollection.addListener((_, changes) => {
    for (const insertionIndex of changes.insertions) {
      observableArray.splice(
        insertionIndex,
        0,
        mobxRealmObject(realmCollection[insertionIndex])
      )
    }

    for (const deletionIndex of changes.deletions) {
      observableArray.splice(deletionIndex, 1)
    }
  })

  return observableArray
}
