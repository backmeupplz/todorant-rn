import { navigate } from '@utils/navigation'
import TodorantWidget from '@upacyxou/react-native-todorant-widget'
import { Platform } from 'react-native'

export function checkAndroidLaunchArgs() {
  if (Platform.OS !== 'android') {
    return
  }
  TodorantWidget.getNewArgs((args?: any) => {
    if (args?.widget) {
      navigate('AddTodo')
    }
  })
}
