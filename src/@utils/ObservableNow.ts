import { getDateString } from '@utils/time'
import { sharedSettingsStore } from '@stores/SettingsStore'
import { observable } from 'mobx'

export function getTodayWithStartOfDay() {
  const now = new Date()
  const today = new Date()
  const startTimeOfDay = sharedSettingsStore.startTimeOfDaySafe
  today.setHours(parseInt(startTimeOfDay.substr(0, 2)))
  today.setMinutes(parseInt(startTimeOfDay.substr(3)))

  if (now < today) {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    return yesterday
  } else {
    return now
  }
}

class ObservableNow {
  @observable todayTitle = getDateString(getTodayWithStartOfDay())

  constructor() {
    setInterval(() => {
      this.updateNow()
    }, 1000)
  }

  private updateNow() {
    const newTodayTitle = getDateString(getTodayWithStartOfDay())
    if (this.todayTitle !== newTodayTitle) {
      this.todayTitle = newTodayTitle
    }
  }
}

export const observableNow = new ObservableNow()
