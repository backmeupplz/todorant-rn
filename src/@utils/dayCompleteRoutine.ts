import { getDateString } from '@utils/time'
import { sharedTodoStore } from '@stores/TodoStore'
import { sharedSettingsStore } from '@stores/SettingsStore'
import { dayCompleteOverlayRef } from '@components/DayCompleteOverlay'
import { playDayComplete } from '@utils/sound'

export function checkDayCompletionRoutine() {
  if (!sharedSettingsStore.soundOn) {
    return
  }
  const today = new Date()
  const todayTodos = sharedTodoStore.todosForDate(getDateString(today))

  const progress = {
    count: todayTodos.length,
    completed: todayTodos.filtered('completed = true').length,
  }

  if (!!progress.count && progress.count === progress.completed) {
    startDayCompleteRoutine()
  }
}

function startDayCompleteRoutine() {
  dayCompleteOverlayRef.startAnimation()
  playDayComplete()
}
