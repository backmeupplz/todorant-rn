import { Platform } from 'react-native'
import { sharedSessionStore } from '@stores/SessionStore'
import { navigate } from '@utils/navigation'

export function plusButtonAction() {
  if (Platform.OS === 'ios') {
    if (!sharedSessionStore.user && !sharedSessionStore.localAppleReceipt) {
      navigate('Paywall', { type: 'appleUnauthorized' })
      return
    }
  }

  if (
    !sharedSessionStore.user?.token &&
    sharedSessionStore.appInstalledMonthAgo
  ) {
    navigate('Login', { loginWall: true })
  } else if (
    !sharedSessionStore.user?.token ||
    sharedSessionStore.isSubscriptionActive
  ) {
    navigate('AddTodo')
  } else {
    navigate(
      'Paywall',
      sharedSessionStore.user.createdOnApple &&
        sharedSessionStore.user.createdAt >= daysAgo(14)
        ? { type: 'appleUnauthorized' }
        : undefined
    )
  }
}

export function daysAgo(count: number) {
  const date = new Date()
  date.setDate(date.getDate() - count)
  return date
}
