import { translate } from '@utils/i18n'
import { Alert, Linking } from 'react-native'
import { checkVersion } from 'react-native-check-version'

export async function checkupVersion() {
  const version = await checkVersion()

  if (version.needsUpdate) {
    Alert.alert(
      `${translate('updateVersionTitle')} ${version.version}!`,
      translate('updateVersionMsg'),
      [
        {
          text: translate('ok'),
          style: 'cancel',
        },
        {
          text: translate('update'),
          onPress: () => Linking.openURL(version.url),
        },
      ],
      { cancelable: false }
    )
  }
}
