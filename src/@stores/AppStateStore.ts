import { observable } from 'mobx'

export enum TodoSectionType {
  planning = 'planning',
  completed = 'completed',
}

class AppStateStore {
  @observable todoSection: TodoSectionType = TodoSectionType.planning
}

export const sharedAppStateStore = new AppStateStore()
