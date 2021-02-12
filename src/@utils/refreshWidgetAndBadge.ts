import TodorantWidget from '@upacyxou/react-native-todorant-widget'
import { Platform, NativeModules } from 'react-native'
import { updateBadgeNumber } from '@utils/notifications'

const WidgetManager = NativeModules.WidgetManager

export function refreshWidgetAndBadge() {
  if (Platform.OS === 'android') {
    TodorantWidget.forceUpdateAll()
  } else {
    WidgetManager.refresh()
  }
  updateBadgeNumber()
}
