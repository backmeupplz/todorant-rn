import { observable } from 'mobx'

export enum TodoSectionType {
  planning = 'planning',
  completed = 'completed',
}

export enum PlanningMode {
  default = 'default',
  rearrange = 'rearrange',
}

class AppStateStore {
  @observable todoSection: TodoSectionType = TodoSectionType.planning
  @observable hash = ''

  @observable planningMode = PlanningMode.default

  @observable languageTag = 'en'
}

export const sharedAppStateStore = new AppStateStore()
