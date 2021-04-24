import { translate } from '@utils/i18n'
import { Alert, Linking } from 'react-native'
import { checkVersion } from 'react-native-check-version'
import DeviceInfo from 'react-native-device-info'

export async function checkupVersion() {
  try {
    const version = await checkVersion()
    const installerPackageName = await DeviceInfo.getInstallerPackageName()
    const url =
      installerPackageName === 'com.huawei.appmarket'
        ? 'https://appgallery.huawei.com/#/app/C102992095'
        : version.url

    if (version.needsUpdate && !__DEV__) {
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
            onPress: () => Linking.openURL(url),
          },
        ],
        { cancelable: false }
      )
    }
  } catch (err) {
    console.warn(err)
  }
}
