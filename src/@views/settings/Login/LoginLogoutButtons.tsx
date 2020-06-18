import React, { Component } from 'react'
import { sharedSessionStore } from '@stores/SessionStore'
import { Text, View } from 'native-base'
import { navigate } from '@utils/navigation'
import { alertConfirm } from '@utils/alert'
import { observer } from 'mobx-react'
import { translate } from '@utils/i18n'
import { sharedColors } from '@utils/sharedColors'
import { Button } from '@components/Button'

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
        {!!sharedSessionStore.user ? (
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
            <Text style={{ marginVertical: 12, color: sharedColors.textColor }}>
              {translate('alreadyRegistered')}
            </Text>
          </>
        )}
      </View>
    )
  }
}
