import { mobxRealmCollection } from '@utils/mobx-realm/collection'
import { mobxRealmObject } from '@utils/mobx-realm/object'
import { createAtom, IAtom, observable } from 'mobx'
import Realm from 'realm'

class MobxRealmModel extends Realm.Object {
  atom: IAtom
  constructor() {
    super()
    const objectName = this.objectSchema().name
    const primaryKey = this.objectSchema().primaryKey

    const atomName = primaryKey
      ? `${objectName}:${(this as any)[primaryKey]}`
      : undefined
    this.atom = createAtom(atomName)
    this.__mobxCollections = {}
    this.__mobxObject = mobxRealmObject(this)
    setTimeout(
      () =>
        this.addListener((object, changes) => {
          if (changes.length > 0) this.atom.reportChanged()
          if (changes.length > 0)
            console.log('changes in ' + this.atom.name, changes)
        }),
      0
    )
  }

  __mobxReadProperty(propertyName) {
    if (this.objectSchema().properties[propertyName]) {
      if (
        this[propertyName] !== null &&
        this[propertyName].hasOwnProperty('__mobxObject')
      ) {
        try {
          return this[propertyName].__mobxObject
        } catch (error) {
          return null
        }
      } else if (
        this[propertyName] !== null &&
        typeof this[propertyName][Symbol.iterator] === 'function' &&
        typeof this[propertyName] !== 'string'
      ) {
        try {
          if (!this.__mobxCollections[propertyName]) {
            this.__mobxCollections[propertyName] = mobxRealmCollection(
              this[propertyName]
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
    return this[propertyName]
  }
}

export default MobxRealmModel
