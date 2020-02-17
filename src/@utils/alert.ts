import { Alert } from 'react-native'

export function alertError(error: Error) {
  setTimeout(() => {
    Alert.alert('Error', error.message, [{ text: 'OK' }])
  }, 500)
}

export function alertConfirm(
  message: string,
  confirmButtonText: string,
  confirm: () => void
) {
  setTimeout(() => {
    Alert.alert('Please confirm', message, [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      { text: confirmButtonText, onPress: confirm },
    ])
  }, 500)
}
