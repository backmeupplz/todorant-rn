import { computed, makeObservable, observable } from 'mobx'

export enum DelegateSectionType {
  ToMe = 'ToMe',
  ByMe = 'ByMe',
  Completed = 'Completed',
}

class DelegateStateStore {
  constructor() {
    makeObservable(this)
  }

  @computed get todoSectionIndex() {
    if (this.todoSection === DelegateSectionType.ToMe) {
      return 0
    }
    if (this.todoSection === DelegateSectionType.ByMe) {
      return 1
    }
    if (this.todoSection === DelegateSectionType.Completed) {
      return 2
    }
  }

  @observable todoSection: DelegateSectionType = DelegateSectionType.ToMe
}

export const sharedDelegateStateStore = new DelegateStateStore()
