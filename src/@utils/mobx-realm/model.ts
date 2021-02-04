import { mobxRealmCollection } from '@utils/mobx-realm/collection'
import { mobxRealmObject } from '@utils/mobx-realm/object'
import { createAtom, IAtom, IObservableArray, observable } from 'mobx'
import Realm from 'realm'

export class MobxRealmModel extends Realm.Object {
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
  }

  __mobxReadProperty(propertyName: string) {
    if (this.objectSchema().properties[propertyName]) {
      const propertyValue = (this as any)[propertyName]
      if (
        propertyValue !== undefined &&
        propertyValue !== null &&
        propertyValue.hasOwnProperty('__mobxObject') &&
        !!propertyValue.__mobxObject
      ) {
        try {
          return propertyValue.__mobxObject
        } catch (error) {
          return null
        }
      } else if (
        propertyValue !== undefined &&
        propertyValue !== null &&
        typeof propertyValue[Symbol.iterator] === 'function' &&
        typeof propertyValue !== 'string'
      ) {
        try {
          if (!this.__mobxCollections[propertyName]) {
            this.__mobxCollections[propertyName] = mobxRealmCollection(
              propertyValue
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
