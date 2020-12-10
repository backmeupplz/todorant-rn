import { observable } from 'mobx'

export enum TodoSectionType {
  planning = 'planning',
  completed = 'completed',
}

class AppStateStore {
  @observable todoSection: TodoSectionType = TodoSectionType.planning
  @observable hash: string[] = []

  @observable languageTag = 'en'

  @observable skipping = false
  @observable searchEnabled = false
  @observable searchQuery: string[] = []
}

export const sharedAppStateStore = new AppStateStore()
