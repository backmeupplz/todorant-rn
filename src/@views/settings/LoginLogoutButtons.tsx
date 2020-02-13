import React, { Component } from 'react'
import { sharedSessionStore } from '@stores/SessionStore'
import { Button, Text, ListItem } from 'native-base'
import { navigate } from '@utils/navigation'
import { alertConfirm } from '@utils/alert'
import { observer } from 'mobx-react'

@observer
export class LoginLogoutButtons extends Component {
  render() {
    return (
      <ListItem style={{ flexDirection: 'column' }}>
        {!!sharedSessionStore.user ? (
          <Button
            block
            onPress={() => {
              alertConfirm('Would you like to logout?', 'Logout', () => {
                sharedSessionStore.logout()
              })
            }}
          >
            <Text>Logout</Text>
          </Button>
        ) : (
          <>
            <Button
              block
              onPress={() => {
                navigate('Login')
              }}
            >
              <Text>Login</Text>
            </Button>
            <Text style={{ marginTop: 5 }}>(You are already registered)</Text>
          </>
        )}
      </ListItem>
    )
  }
}
