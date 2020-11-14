import { sharedSettingsStore } from '@stores/SettingsStore'
import { observable } from 'mobx'
import moment from 'moment'

export function getDateMonthAndYearString(date: Date | string) {
  if (date instanceof Date) {
    return getDateString(date).substr(0, 7)
  }
  return date.substr(0, 7)
}

export function getDateDateString(date: Date | string) {
  if (date instanceof Date) {
    return getDateString(date).substr(8, 2)
  }
  return date.substr(8, 2)
}

export function getDateString(date: Date) {
  return `${date.getFullYear()}-${
    date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : date.getMonth() + 1
  }-${date.getDate() < 10 ? `0${date.getDate()}` : date.getDate()}`
}

export function getDateFromString(
  monthAndYearString: string,
  dateString?: string
) {
  return dateString
    ? moment(`${monthAndYearString}-${dateString}`, 'YYYY-MM-DD').toDate()
    : moment(monthAndYearString, 'YYYY-MM').toDate()
}

export function getDateFromFullString(fullString: string) {
  return moment(fullString, 'YYYY-MM-DD').toDate()
}

export function isDateTooOld(date: string, today: string) {
  const todayDay = today.substr(8)
  const todayMonthAndYear = today.substr(0, 7)

  if (date.length === 7) {
    // month and year
    if (date <= todayMonthAndYear) {
      return true
    }
  } else {
    const day = date.substr(8)
    const monthAndYear = date.substr(0, 7)
    if (monthAndYear < todayMonthAndYear) {
      return true
    }
    if (monthAndYear === todayMonthAndYear && day < todayDay) {
      return true
    }
  }
  return false
}

export function isToday(monthAndYear: string, date: string) {
  const today = getDateString(new Date())
  const todayDay = today.substr(8)
  const todayMonthAndYear = today.substr(0, 7)
  return todayMonthAndYear === monthAndYear && todayDay === date
}

export function getDateStringFromTodo(todo: {
  monthAndYear?: string
  date?: string
}) {
  return `${todo.monthAndYear}${todo.date ? `-${todo.date}` : ''}`
}

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
  @observable now = new Date()

  constructor() {
    setInterval(() => {
      this.now = new Date()
    }, 1000)
  }
}

export const observableNow = new ObservableNow()
