import { MelonTodo } from '@models/MelonTodo'
import { Platform } from 'react-native'
import { navigate } from '@utils/navigation'
import { sharedOnboardingStore } from '@stores/OnboardingStore'
import { sharedSessionStore } from '@stores/SessionStore'

export function checkSubscriptionAndNavigate(
  screen: 'AddTodo' | 'EditTodo' | 'BreakdownTodo',
  params?: {
    date?: string
    editedTodo?: MelonTodo
    breakdownTodo?: MelonTodo
  }
) {
  if (Platform.OS === 'ios' && sharedOnboardingStore.tutorialIsShown) {
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
    navigate(screen, { ...params })
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
