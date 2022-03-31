import { sharedSettingsStore } from '@stores/SettingsStore'
import { sharedTodoStore } from '@stores/TodoStore'
import { translate } from '@utils/i18n'
import PushNotification, {
  PushNotificationPermissions,
} from 'react-native-push-notification'
import PushNotificationIOS from '@react-native-community/push-notification-ios'

PushNotification.createChannel(
  {
    channelId: 'todorant',
    channelName: 'Todorant-channel',
    vibrate: true,
  },
  () => {
    // Do nothing
  }
)

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
      sharedTodoStore.uncompletedTodayAmount
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
    channelId: 'todorant',
    message: translate('planningReminderText'),
    date,
    repeatType: 'day',
    allowWhileIdle: true,
  })
}

export function stopReminders() {
  PushNotification.cancelAllLocalNotifications()
}
