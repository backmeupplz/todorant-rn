import { observable } from 'mobx'

export enum TodoSectionType {
  planning = 'planning',
  completed = 'completed',
}

class AppStateStore {
  @observable todoSection: TodoSectionType = TodoSectionType.planning
  @observable hash = ''
}

export const sharedAppStateStore = new AppStateStore()
