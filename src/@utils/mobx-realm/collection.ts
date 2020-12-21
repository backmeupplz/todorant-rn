import { MobxRealmModel } from '@utils/mobx-realm/model'
import { mobxRealmObject } from '@utils/mobx-realm/object'
import { observable } from 'mobx'
import Realm from 'realm'

export function mobxRealmCollection<T extends MobxRealmModel>(
  realmCollection: Realm.Results<T>
) {
  const observableArray = observable.array<T>()
  realmCollection.forEach((realmObject) => {
    observableArray.push(mobxRealmObject(realmObject))
  })

  realmCollection.addListener((_, changes) => {
    for (const deletionIndex of changes.deletions) {
      observableArray.splice(deletionIndex, 1)
    }
    for (const insertionIndex of changes.insertions) {
      observableArray.splice(
        insertionIndex,
        0,
        mobxRealmObject(realmCollection[insertionIndex])
      )
    }
  })

  return observableArray
}
