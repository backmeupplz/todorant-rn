import React, { Component } from 'react'
import { Container, Content, Text, Button, Spinner } from 'native-base'
import { GoogleSignin } from '@react-native-community/google-signin'
import { alertError } from '@utils/alert'
import * as rest from '@utils/rest'
import { sharedSessionStore } from '@stores/SessionStore'
import { goBack, navigate } from '@utils/navigation'
import { observable } from 'mobx'
import { observer } from 'mobx-react'
import { AccessToken, LoginManager } from 'react-native-fbsdk'

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

  loginWithFacebook = async () => {
    this.loading = true
    try {
      const facebookUserInfo = await LoginManager.logInWithPermissions([
        'public_profile',
        'email',
      ])
      if (!facebookUserInfo.grantedPermissions) {
        throw new Error('Facebook permissions not granted')
      }
      const token = await AccessToken.getCurrentAccessToken()
      if (!token) {
        throw new Error('Facebook access token cannot be obtained')
      }
      const todorantUserInfo = (await rest.loginFacebook(token.accessToken))
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
            style={{
              justifyContent: 'center',
              backgroundColor: 'tomato',
              marginBottom: 10,
            }}
            onPress={this.vm.loginWithGoogle}
            disabled={this.vm.loading}
          >
            <Text>Login with Google</Text>
          </Button>
          <Button
            style={{
              justifyContent: 'center',
              backgroundColor: 'cornflowerblue',
              marginBottom: 10,
            }}
            onPress={this.vm.loginWithFacebook}
            disabled={this.vm.loading}
          >
            <Text>Login with Facebook</Text>
          </Button>
        </Content>
      </Container>
    )
  }
}
