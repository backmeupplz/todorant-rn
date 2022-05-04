import { NativeModules, Platform } from 'react-native'
import { updateBadgeNumber } from '@utils/notifications'
import TodorantWidget from '@upacyxou/react-native-todorant-widget'

const WidgetManager = NativeModules.WidgetManager
const WatchUpdateManager = NativeModules.WatchUpdateManager

export function refreshWidgetAndBadgeAndWatch() {
  updateBadgeNumber()
  if (Platform.OS === 'android') {
    TodorantWidget.forceUpdateAll()
  } else {
    WidgetManager.refresh()
    WatchUpdateManager.updateContext()
  }
}
