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

export function getNotificationPermissions(): Promise<
  PushNotificationPermissions
> {
  return new Promise((res) => {
    PushNotification.checkPermissions((permissions) => {
      res(permissions)
    })
  })
}
