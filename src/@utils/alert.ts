import { translate } from '@utils/i18n'
import { Alert, Linking } from 'react-native'

export function alertError(
  error: Error | string,
  confirmButtonText?: string,
  confirm?: () => void
) {
  setTimeout(() => {
    Alert.alert(
      translate('error'),
      typeof error === 'string' ? error : error.message,
      confirmButtonText && confirm
        ? [
            { text: confirmButtonText, onPress: confirm },
            { text: translate('ok') },
          ]
        : [{ text: translate('ok') }]
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

export function alertSupport() {
  setTimeout(() => {
    Alert.alert(translate('supportLabel'), translate('supportText'), [
      {
        text: translate('cancel'),
        style: 'cancel',
      },
      {
        text: 'n@borodutch.com',
        onPress: () => {
          Linking.openURL('mailto:n@borodutch.com')
        },
      },
      {
        text: '@borodutch',
        onPress: () => {
          Linking.openURL('https://t.me/borodutch')
        },
      },
    ])
  }, 100)
}
