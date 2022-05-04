import { Button } from '@components/Button'
import { Component } from 'react'
import { Text, View } from 'native-base'
import { alertConfirm } from '@utils/alert'
import { navigate } from '@utils/navigation'
import { observer } from 'mobx-react'
import { sharedColors } from '@utils/sharedColors'
import { sharedSessionStore } from '@stores/SessionStore'
import { translate } from '@utils/i18n'
import React from 'react'

@observer
export class LoginLogoutButtons extends Component {
  render() {
    return (
      <View
        style={{
          flexDirection: 'column',
          paddingHorizontal: 16,
          alignItems: 'center',
          marginVertical: 16,
        }}
      >
        {sharedSessionStore.user ? (
          <Button
            style={{ flex: 1, borderRadius: 10 }}
            block
            onPress={() => {
              alertConfirm(translate('logoutText'), translate('logout'), () => {
                sharedSessionStore.logout()
              })
            }}
          >
            <Text>{translate('logout')}</Text>
          </Button>
        ) : (
          <>
            <Button
              style={{ flex: 1, borderRadius: 10 }}
              block
              onPress={() => {
                navigate('Login')
              }}
            >
              <Text>{translate('loginButton')}</Text>
            </Button>
            <Text
              style={{
                marginVertical: 12,
                ...sharedColors.regularTextExtraStyle.style,
              }}
            >
              {translate('alreadyRegistered')}
            </Text>
          </>
        )}
      </View>
    )
  }
}
