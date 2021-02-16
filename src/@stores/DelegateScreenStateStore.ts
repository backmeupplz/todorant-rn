import { makeObservable, observable } from 'mobx'

export enum DelegateSectionType {
  toMe = 'toMe',
  byMe = 'byMe',
}

class DelegateStateStore {
  constructor() {
    makeObservable(this)
  }
  @observable todoSection: DelegateSectionType = DelegateSectionType.toMe

  @observable languageTag = 'en'
}

export const sharedDelegateStateStore = new DelegateStateStore()
