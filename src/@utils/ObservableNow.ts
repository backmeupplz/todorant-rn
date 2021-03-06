import { getDateString, getTodayWithStartOfDay } from '@utils/time'
import { makeObservable, observable } from 'mobx'
import { EventEmitter } from 'events'

export enum ObservableNowEventEmitterEvent {
  ObservableNowChanged = 'ObservableNowChanged',
  Logout = 'Logout',
}
export const observableNowEventEmitter = new EventEmitter()

class ObservableNow {
  @observable todayTitle = getDateString(getTodayWithStartOfDay())

  constructor() {
    makeObservable(this)
    setInterval(() => {
      this.updateNow()
    }, 1000)
  }

  private updateNow() {
    const newTodayTitle = getDateString(getTodayWithStartOfDay())
    if (this.todayTitle !== newTodayTitle) {
      this.todayTitle = newTodayTitle
      observableNowEventEmitter.emit(
        ObservableNowEventEmitterEvent.ObservableNowChanged
      )
    }
  }
}

export const observableNow = new ObservableNow()
