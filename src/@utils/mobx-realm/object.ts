import Realm from 'realm'

const proxyHandler = {
  get: (target: any, property: any) => {
    return target.__mobxReadProperty(property)
  },
}

export function mobxRealmObject<T>(
  realmObject: (Realm.Object & T) | undefined
) {
  if (!realmObject) {
    return realmObject
  }
  if (realmObject.hasOwnProperty('__mobxObject')) {
    return (realmObject as any).__mobxObject
  }
  return new Proxy(realmObject, proxyHandler)
}
