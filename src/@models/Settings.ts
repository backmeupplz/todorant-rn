import { GoogleCalendarCredentials } from '@models/GoogleCalendarCredentials'

export interface Settings {
  showTodayOnAddTodo?: boolean
  firstDayOfWeek?: number
  newTodosGoFirst?: boolean
  preserveOrderByTime?: boolean
  duplicateTagInBreakdown?: boolean
  updatedAt?: Date
  googleCalendarCredentials?: GoogleCalendarCredentials
  language?: string
}
