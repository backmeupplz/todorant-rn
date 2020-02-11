import moment from 'moment'

export function getDateMonthAndYearString(date: Date | string) {
  return (date instanceof Date ? getDateString(date) : date).substr(0, 7)
}

export function getDateDateString(date: Date | string) {
  return (date instanceof Date ? getDateString(date) : date).substr(8, 2)
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
