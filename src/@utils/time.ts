import { Todo } from '@models/Todo'
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

export function getDateStringFromTodo(todo: Todo) {
  return `${todo.monthAndYear}${todo.date ? `-${todo.date}` : ''}`
}
