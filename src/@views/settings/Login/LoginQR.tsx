import { Component } from 'react'
import { Container } from 'native-base'
import { Observer, observer } from 'mobx-react'
import { RouteProp, useRoute } from '@react-navigation/native'
import { Text } from 'native-base'
import { goBack } from '@utils/navigation'
import { sharedColors } from '@utils/sharedColors'
import { translate } from '@utils/i18n'
import QRCodeScanner from 'react-native-qrcode-scanner'
import React from 'react'

@observer
class LoginQRContent extends Component<{
  route: RouteProp<
    Record<string, { getToken: (token: string) => void }>,
    string
  >
}> {
  render() {
    return (
      <Container
        style={{
          backgroundColor: sharedColors.backgroundColor,
          alignItems: 'center',
        }}
      >
        <QRCodeScanner
          vibrate={false}
          onRead={(e) => {
            if (e.data) {
              goBack()
              this.props.route.params.getToken(e.data)
            }
          }}
          topContent={
            <Text
              style={{
                ...sharedColors.textExtraStyle.style,
                textAlign: 'center',
                padding: 20,
              }}
            >
              {translate('qrDescription')}
            </Text>
          }
          notAuthorizedView={
            <Observer>
              {() => (
                <Text
                  style={{
                    ...sharedColors.textExtraStyle.style,
                    textAlign: 'center',
                    margin: 20,
                  }}
                >
                  {translate('cameraAuthorization')}
                </Text>
              )}
            </Observer>
          }
          permissionDialogMessage={translate('needCameraPermission')}
          permissionDialogTitle={translate('info')}
          buttonPositive={translate('ok')}
          showMarker
          cameraStyle={{
            overflow: 'hidden',
          }}
        />
      </Container>
    )
  }
}

export const LoginQR = () => {
  const route =
    useRoute<
      RouteProp<Record<string, { getToken: (token: string) => void }>, string>
    >()
  return <LoginQRContent route={route} />
}
