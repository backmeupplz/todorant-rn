import { translate } from '@utils/i18n'
import { sharedTodoStore } from '@stores/TodoStore'
import { sharedSettingsStore } from '@stores/SettingsStore'
import PushNotificationIOS from '@react-native-community/push-notification-ios'
import PushNotification, {
  PushNotificationPermissions,
} from 'react-native-push-notification'

PushNotification.configure({
  onRegister: (token) => {
    console.log('Push notification token:', token)
  },
  onNotification: (notification) => {
    console.log('Received notification:', notification)
    notification.finish(PushNotificationIOS.FetchResult.NoData)
  },
  permissions: {
    badge: true,
    alert: true,
  },
  popInitialNotification: true,
  requestPermissions: false,
})

export function resetBadgeNumber() {
  PushNotification.setApplicationIconBadgeNumber(0)
}

export function updateBadgeNumber() {
  if (!sharedSettingsStore) {
    return
  }
  if (sharedSettingsStore.badgeIconCurrentCount) {
    PushNotification.setApplicationIconBadgeNumber(
      sharedTodoStore.progress.count - sharedTodoStore.progress.completed
    )
  } else {
    resetBadgeNumber()
  }
}

export function getNotificationPermissions(): Promise<PushNotificationPermissions> {
  return new Promise((res) => {
    PushNotification.checkPermissions((permissions) => {
      res(permissions)
    })
  })
}

export function scheduleReminders(time: string) {
  // Stop existing reminders
  stopReminders()
  // Get
  const date = new Date()
  const startTimeOfDay = time
  date.setHours(parseInt(startTimeOfDay.substr(0, 2)))
  date.setMinutes(parseInt(startTimeOfDay.substr(3)))
  // Move to tomorrow
  if (new Date().getTime() > date.getTime()) {
    date.setDate(date.getDate() + 1)
  }
  // Schedule notifications
  PushNotification.localNotificationSchedule({
    message: translate('planningReminderText'),
    date,
    repeatType: 'day',
    allowWhileIdle: true,
    // Have to cast it because of allowWhileIdle https://github.com/DefinitelyTyped/DefinitelyTyped/pull/48214
  } as any)
}

export function stopReminders() {
  PushNotification.cancelAllLocalNotifications()
}
