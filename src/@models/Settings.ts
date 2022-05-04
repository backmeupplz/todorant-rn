import { GoogleCalendarCredentials } from '@models/GoogleCalendarCredentials'

export interface Settings {
  showTodayOnAddTodo?: boolean
  firstDayOfWeek?: number
  startTimeOfDay?: string
  newTodosGoFirst?: boolean
  preserveOrderByTime?: boolean
  duplicateTagInBreakdown?: boolean
  showMoreByDefault?: boolean
  updatedAt?: Date
  googleCalendarCredentials?: GoogleCalendarCredentials
  language?: string
  removeCompletedFromCalendar?: boolean
}
