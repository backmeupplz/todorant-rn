import { MelonTodo } from '@models/MelonTodo'
import { Todo } from '@models/Todo'
import { sharedSettingsStore } from '@stores/SettingsStore'
import { getDateDateString, getDateMonthAndYearString } from '@utils/time'

export function isTodoOld(todo: MelonTodo) {
  const now = new Date()
  const day = getDateDateString(now)
  const monthAndYear = getDateMonthAndYearString(now)

  const startTimeOfDay = sharedSettingsStore.startTimeOfDaySafe
  const yesterday = parseInt(day) - 1
  const todayDate = new Date()
  todayDate.setHours(parseInt(startTimeOfDay.substr(0, 2)))
  todayDate.setMinutes(parseInt(startTimeOfDay.substr(3)))

  // Exact date exists or not
  if (todo.date) {
    if (todo.monthAndYear && todo.monthAndYear < monthAndYear) {
      return true
    }
    if (
      todo.monthAndYear === monthAndYear &&
      parseInt(todo.date) == yesterday &&
      now >= todayDate
    ) {
      return true
    }
    if (todo.monthAndYear === monthAndYear && parseInt(todo.date) < yesterday) {
      return true
    }
  } else {
    if (todo.monthAndYear && todo.monthAndYear <= monthAndYear) {
      return true
    }
  }
  return false
}
