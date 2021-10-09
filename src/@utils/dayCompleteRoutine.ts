import { getDateString, getTodayWithStartOfDay } from '@utils/time'

import { Q } from '@nozbe/watermelondb'
import { TodoColumn } from './melondb'
import { dayCompleteOverlayRef } from '@components/DayCompleteOverlay'
import { playDayComplete } from '@utils/sound'
import { sharedSettingsStore } from '@stores/SettingsStore'
import { sharedTodoStore } from '@stores/TodoStore'

export async function shouldShowDayCompletionRoutine() {
  if (!sharedSettingsStore.soundOn && !sharedSettingsStore.endOfDaySoundOn) {
    return false
  }
  const today = getTodayWithStartOfDay()
  const todayTodos = sharedTodoStore.todosForDate(getDateString(today))

  const progress = {
    count: await todayTodos.fetchCount(),
    completed: await todayTodos
      .extend(Q.where(TodoColumn.completed, true))
      .fetchCount(),
  }

  if (!!progress.count && progress.count === progress.completed) {
    return true
  }

  return false
}

export async function checkDayCompletionRoutine() {
  if (await shouldShowDayCompletionRoutine()) {
    startDayCompleteRoutine()
  }
}

function startDayCompleteRoutine() {
  dayCompleteOverlayRef.startAnimation()
  playDayComplete()
}
