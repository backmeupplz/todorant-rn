import { GoogleCalendarCredentials } from '@models/GoogleCalendarCredentials'

export interface Settings {
  showTodayOnAddTodo?: boolean
  firstDayOfWeek?: number
  newTodosGoFirst?: boolean
  preserveOrderByTime?: boolean
  updatedAt?: Date
  googleCalendarCredentials?: GoogleCalendarCredentials
}
