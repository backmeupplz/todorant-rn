import React, { Component } from 'react'
import { sharedSessionStore } from '@stores/SessionStore'
import { Text, ListItem } from 'native-base'
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
      <ListItem
        style={{
          borderColor: sharedColors.placeholderColor,
          flexDirection: 'column',
        }}
      >
        {!!sharedSessionStore.user ? (
          <Button
            style={{ flex: 1 }}
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
              style={{ flex: 1 }}
              block
              onPress={() => {
                navigate('Login')
              }}
            >
              <Text>{translate('loginButton')}</Text>
            </Button>
            <Text style={{ marginTop: 5, color: sharedColors.textColor }}>
              {translate('alreadyRegistered')}
            </Text>
          </>
        )}
      </ListItem>
    )
  }
}
