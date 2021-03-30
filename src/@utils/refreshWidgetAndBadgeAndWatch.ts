import TodorantWidget from '@upacyxou/react-native-todorant-widget'
import { Platform, NativeModules } from 'react-native'
import { updateBadgeNumber } from '@utils/notifications'

const WidgetManager = NativeModules.WidgetManager
const WatchUpdateManager = NativeModules.WatchUpdateManager

export function refreshWidgetAndBadgeAndWatch() {
  if (Platform.OS === 'android') {
    TodorantWidget.forceUpdateAll()
  } else {
    WidgetManager.refresh()
    WatchUpdateManager.updateContext()
  }
  updateBadgeNumber()
}
