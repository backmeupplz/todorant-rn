import { navigate } from '@utils/navigation'
import TodorantWidget from 'react-native-todorant-widget'

export function checkAndroidLaunchArgs() {
  TodorantWidget.getNewArgs((args?: any) => {
    if (args?.widget) {
      navigate('AddTodo')
    }
  })
}
