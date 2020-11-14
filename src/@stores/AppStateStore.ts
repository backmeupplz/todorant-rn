import { observable } from 'mobx'

export enum TodoSectionType {
  planning = 'planning',
  completed = 'completed',
}

class AppStateStore {
  @observable todoSection: TodoSectionType = TodoSectionType.planning
  @observable hash: string[] = []

  @observable languageTag = 'en'

  @observable searchEnabled = false
  @observable searchQuery: string[] = []

  @observable calendarEnabled = false
  @observable activeCoordinates = { x: 0, y: 0 }
  @observable activeDay = 0
}

export const sharedAppStateStore = new AppStateStore()
