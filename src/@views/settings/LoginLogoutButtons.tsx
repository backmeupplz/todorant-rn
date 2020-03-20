import React, { Component } from 'react'
import { sharedSessionStore } from '@stores/SessionStore'
import { Button, Text, ListItem } from 'native-base'
import { navigate } from '@utils/navigation'
import { alertConfirm } from '@utils/alert'
import { observer } from 'mobx-react'
import { translate } from '@utils/i18n'

@observer
export class LoginLogoutButtons extends Component {
  render() {
    return (
      <ListItem style={{ flexDirection: 'column' }}>
        {!!sharedSessionStore.user ? (
          <Button
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
              block
              onPress={() => {
                navigate('Login')
              }}
            >
              <Text>{translate('login')}</Text>
            </Button>
            <Text style={{ marginTop: 5 }}>
              {translate('alreadyRegistered')}
            </Text>
          </>
        )}
      </ListItem>
    )
  }
}
