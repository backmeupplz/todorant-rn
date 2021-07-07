import { getDateString, getTodayWithStartOfDay } from '@utils/time'
import { sharedTodoStore } from '@stores/TodoStore'
import { sharedSettingsStore } from '@stores/SettingsStore'
import { dayCompleteOverlayRef } from '@components/DayCompleteOverlay'
import { playDayComplete } from '@utils/sound'

export function shouldShowDayCompletionRoutine() {
  if (!sharedSettingsStore.soundOn && !sharedSettingsStore.endOfDaySoundOn) {
    return false
  }
  const today = getTodayWithStartOfDay()
  const todayTodos = sharedTodoStore.todosForDate(getDateString(today))

  const progress = {
    count: 0,
    completed: 0,
  }

  if (!!progress.count && progress.count === progress.completed) {
    return true
  }

  return false
}

export function checkDayCompletionRoutine() {
  if (shouldShowDayCompletionRoutine()) {
    startDayCompleteRoutine()
  }
}

function startDayCompleteRoutine() {
  dayCompleteOverlayRef.startAnimation()
  playDayComplete()
}
