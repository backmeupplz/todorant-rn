import { observable, computed } from 'mobx'

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

  @observable text = ''
  @observable addOnTop = false
  @observable completed = false
  @observable frog = false
  @observable monthAndYear?: string
  @observable date?: string
  @observable time?: string

  @computed get isDirtyState() {
    if (
      this.text ||
      this.addOnTop ||
      this.completed ||
      this.frog ||
      this.monthAndYear ||
      this.date ||
      this.time
    )
      return true
    return false
  }
  @computed get cleanState() {
    this.text = ''
    this.addOnTop = false
    this.completed = false
    this.frog = false
    this.monthAndYear = ''
    this.date = ''
    this.time = ''
    return
  }
}

export const sharedAppStateStore = new AppStateStore()
