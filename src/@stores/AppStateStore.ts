import { Todo } from '@models/Todo'
import { action, computed, observable } from 'mobx'

export enum TodoSectionType {
  planning = 'planning',
  completed = 'completed',
}

interface editedTodoData {
  tempSync: string
  date: string
}

class AppStateStore {
  @observable todoSection: TodoSectionType = TodoSectionType.planning
  @observable hash: string[] = []

  @observable languageTag = 'en'

  @observable skipping = false
  @observable searchEnabled = false
  @observable searchQuery: string[] = []
  @observable loading = false

  @observable todosToTop: Todo[] = []
  @observable editedTodo = {} as {
    tempSync: string
    beforeEdit: string
    afterEdit: string
  }

  @action changeLoading = (state: boolean) => {
    this.loading = state
  }

  @computed get testLoader() {
    return this.loading
  }

  @observable calendarEnabled = false
  @observable activeCoordinates = { x: 0, y: 0 }
  @observable activeDay: Date | undefined = undefined
}

export const sharedAppStateStore = new AppStateStore()
