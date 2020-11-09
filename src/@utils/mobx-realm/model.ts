import { mobxRealmCollection } from '@utils/mobx-realm/collection'
import { mobxRealmObject } from '@utils/mobx-realm/object'
import { createAtom, IAtom, IObservableArray, observable } from 'mobx'
import Realm from 'realm'

class MobxRealmModel extends Realm.Object {
  atom: IAtom
  __mobxCollections: { [index: string]: IObservableArray<Realm.Object> }
  __mobxObject: any

  constructor() {
    super()
    const objectName = this.objectSchema().name
    const primaryKey = this.objectSchema().primaryKey

    const atomName = primaryKey
      ? `${objectName}:${(this as any)[primaryKey]}`
      : `${objectName}:${this._objectId}`
    this.atom = createAtom(atomName)
    this.__mobxCollections = {}
    this.__mobxObject = mobxRealmObject(this)
    setTimeout(
      () =>
        this.addListener((_, changes) => {
          if (changes.changedProperties.length > 0) {
            this.atom.reportChanged()
            console.log('changes in ' + this.atom.name, changes)
          }
        }),
      0
    )
  }

  __mobxReadProperty(propertyName: string) {
    if (this.objectSchema().properties[propertyName]) {
      if (
        (this as any)[propertyName] !== null &&
        (this as any)[propertyName].hasOwnProperty('__mobxObject')
      ) {
        try {
          return (this as any)[propertyName].__mobxObject
        } catch (error) {
          return null
        }
      } else if (
        (this as any)[propertyName] !== null &&
        typeof (this as any)[propertyName][Symbol.iterator] === 'function' &&
        typeof (this as any)[propertyName] !== 'string'
      ) {
        try {
          if (!this.__mobxCollections[propertyName]) {
            this.__mobxCollections[propertyName] = mobxRealmCollection(
              (this as any)[propertyName]
            )
          }
          return this.__mobxCollections[propertyName]
        } catch (error) {
          return observable.array()
        }
      } else {
        this.atom.reportObserved()
      }
    }
    return (this as any)[propertyName]
  }
}

export default MobxRealmModel
