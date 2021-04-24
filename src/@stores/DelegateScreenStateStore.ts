import { makeObservable, observable } from 'mobx'

export enum DelegateSectionType {
  ToMe = 'ToMe',
  ByMe = 'ByMe',
}

class DelegateStateStore {
  constructor() {
    makeObservable(this)
  }
  @observable todoSection: DelegateSectionType = DelegateSectionType.ToMe
}

export const sharedDelegateStateStore = new DelegateStateStore()
