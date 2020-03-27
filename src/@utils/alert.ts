import { translate } from '@utils/i18n'
import { Alert } from 'react-native'

export function alertError(error: Error | string) {
  setTimeout(() => {
    Alert.alert(
      translate('error'),
      typeof error === 'string' ? error : error.message,
      [{ text: translate('ok') }]
    )
  }, 100)
}

export function alertConfirm(
  message: string,
  confirmButtonText: string,
  confirm: () => void
) {
  setTimeout(() => {
    Alert.alert(translate('pleaseConfirm'), message, [
      {
        text: translate('cancel'),
        style: 'cancel',
      },
      { text: confirmButtonText, onPress: confirm },
    ])
  }, 100)
}

export function alertMessage(title: string, message: string, ok?: () => void) {
  setTimeout(() => {
    Alert.alert(title, message, [{ text: translate('ok'), onPress: ok }])
  }, 100)
}
