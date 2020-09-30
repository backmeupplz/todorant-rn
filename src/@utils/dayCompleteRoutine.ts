import { getDateString } from '@utils/time'
import { sharedTodoStore } from '@stores/TodoStore'
import { sharedSettingsStore } from '@stores/SettingsStore'
import { dayCompleteOverlayRef } from '@components/DayCompleteOverlay'
import { playDayComplete } from '@utils/sound'

export function shouldShowDayCompletionRoutine() {
  if (!sharedSettingsStore.soundOn && !sharedSettingsStore.endOfDaySoundOn) {
    return false
  }
  const today = new Date()
  const todayTodos = sharedTodoStore.todosForDate(getDateString(today))

  const progress = {
    count: todayTodos.length,
    completed: todayTodos.filtered('completed = true').length,
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
