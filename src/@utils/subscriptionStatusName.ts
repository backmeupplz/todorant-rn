import { SubscriptionStatus } from '@models/User'
import { sharedSessionStore } from '@stores/SessionStore'
import { translate } from '@utils/i18n'

export function subscriptionStatusName(
  subscriptionStatus?: SubscriptionStatus
) {
  switch (subscriptionStatus) {
    case SubscriptionStatus.earlyAdopter:
      return () => translate('earlyAdopter')
    case SubscriptionStatus.active:
      return () => translate('active')
    case SubscriptionStatus.trial:
      if (
        sharedSessionStore.isTrialOver ||
        sharedSessionStore.user?.createdOnApple
      ) {
        return () => translate('inactive')
      } else {
        return () => translate('trial')
      }
    case SubscriptionStatus.inactive:
      return () => translate('inactive')
    default:
      return () => ''
  }
}
