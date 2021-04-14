import { sharedSettingsStore } from '@stores/SettingsStore'
import { isHydrated } from '@stores/hydration/hydratedStores'
import { Platform } from 'react-native'
import { sharedSessionStore } from '@stores/SessionStore'
import Axios from 'axios'

export function logEventToMicro(name: string) {
  if (!isHydrated()) {
    return
  }
  return Axios.post('https://micro.todorant.com', {
    userId: sharedSessionStore.user?._id || sharedSessionStore.installationId,
    name,
    timestamp: Date.now(),
    platform: Platform.OS,
    language: sharedSettingsStore.language || 'unknown',
    userAgent: `${Platform.Version}`,
    debug: __DEV__ ? true : undefined,
    isAnonymous: !sharedSessionStore.user,
    installationId: sharedSessionStore.installationId,
  })
}
