import React, { Component } from 'react'
import { Container, Content, Text, Button, Spinner } from 'native-base'
import { GoogleSignin } from '@react-native-community/google-signin'
import { alertError } from '@utils/alert'
import * as rest from '@utils/rest'
import { sharedSessionStore } from '@stores/SessionStore'
import { goBack } from '@utils/navigation'
import { observable } from 'mobx'
import { observer } from 'mobx-react'

class LoginVM {
  @observable loading = false

  loginWithGoogle = async () => {
    this.loading = true
    try {
      await GoogleSignin.hasPlayServices()
      const googleUserInfo = await GoogleSignin.signIn()
      if (!googleUserInfo.idToken) {
        throw new Error('No access token returned from Google')
      }
      const todorantUserInfo = (await rest.loginGoogle(googleUserInfo.idToken))
        .data
      sharedSessionStore.login(todorantUserInfo)
      goBack()
    } catch (error) {
      alertError(error)
    } finally {
      this.loading = false
    }
  }
}

@observer
export class Login extends Component {
  vm = new LoginVM()

  render() {
    return (
      <Container>
        <Content style={{ padding: 10 }}>
          {this.vm.loading && <Spinner />}
          <Button
            style={{ justifyContent: 'center', backgroundColor: 'tomato' }}
            onPress={this.vm.loginWithGoogle}
            disabled={this.vm.loading}
          >
            <Text>Login with Google</Text>
          </Button>
        </Content>
      </Container>
    )
  }
}
