import { Platform } from 'react-native'
import changeNavigationBarColor from 'react-native-navigation-bar-color'

export function updateAndroidNavigationBarColor(dark: boolean) {
  if (Platform.OS !== 'android') {
    return
  }
  // Have to duplicate color hex here to avoid require cycle with colors
  changeNavigationBarColor(dark ? '#19191A' : '#FCFCFE', !dark, true)
}
