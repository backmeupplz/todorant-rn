import { Alert } from 'react-native'

export function alertError(error: Error) {
  Alert.alert('Error', error.message, [{ text: 'OK' }])
}

export function alertConfirm(
  message: string,
  confirmButtonText: string,
  confirm: () => void
) {
  Alert.alert('Please confirm', message, [
    {
      text: 'Cancel',
      style: 'cancel',
    },
    { text: confirmButtonText, onPress: confirm },
  ])
}
