import { sharedColors } from './sharedColors'
import { Platform } from 'react-native'
import changeNavigationBarColor from 'react-native-navigation-bar-color'

export function updateAndroidNavigationBarColor() {
  if (Platform.OS !== 'android') {
    return
  }
  changeNavigationBarColor(
    sharedColors.backgroundColor,
    !sharedColors.isDark,
    true
  )
}
