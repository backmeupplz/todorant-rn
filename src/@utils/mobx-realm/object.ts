import { MobxRealmModel } from '@utils/mobx-realm/model'

const proxyHandler = {
  get: (target: any, property: any) => {
    return target.__mobxReadProperty(property)
  },
}

export function mobxRealmObject<T extends MobxRealmModel>(realmObject: T): T {
  if (realmObject.hasOwnProperty('__mobxObject') && realmObject.__mobxObject) {
    return (realmObject as any).__mobxObject
  }
  return new Proxy<T>(realmObject, proxyHandler)
}
