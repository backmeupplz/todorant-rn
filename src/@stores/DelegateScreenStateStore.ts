import { observable } from 'mobx'

export enum DelegateSectionType {
  toMe = 'toMe',
  byMe = 'byMe',
}

class DelegateStateStore {
  @observable todoSection: DelegateSectionType = DelegateSectionType.toMe

  @observable languageTag = 'en'
}

export const sharedDelegateStateStore = new DelegateStateStore()
