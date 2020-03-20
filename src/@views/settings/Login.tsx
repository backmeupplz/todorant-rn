import React, { Component } from 'react'
import { Container, Content, Text, Button, Spinner, View } from 'native-base'
import { GoogleSignin } from '@react-native-community/google-signin'
import { alertError } from '@utils/alert'
import * as rest from '@utils/rest'
import { sharedSessionStore } from '@stores/SessionStore'
import { goBack } from '@utils/navigation'
import { observable } from 'mobx'
import { observer } from 'mobx-react'
import { AccessToken, LoginManager } from 'react-native-fbsdk'
import { RouteProp, useRoute } from '@react-navigation/native'
import { translate } from '@utils/i18n'

class LoginVM {
  @observable loading = false

  loginWithGoogle = async () => {
    this.loading = true
    try {
      await GoogleSignin.hasPlayServices()
      const googleUserInfo = await GoogleSignin.signIn()
      if (!googleUserInfo.idToken) {
        throw new Error(translate('googleTokenError'))
      }
      const todorantUserInfo = (await rest.loginGoogle(googleUserInfo.idToken))
        .data
      todorantUserInfo.createdAt = new Date(todorantUserInfo.createdAt)
      todorantUserInfo.updatedAt = new Date(todorantUserInfo.updatedAt)
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
        throw new Error(translate('facebookPermissionsError'))
      }
      const token = await AccessToken.getCurrentAccessToken()
      if (!token) {
        throw new Error(translate('facebookTokenError'))
      }
      const todorantUserInfo = (await rest.loginFacebook(token.accessToken))
        .data
      todorantUserInfo.createdAt = new Date(todorantUserInfo.createdAt)
      todorantUserInfo.updatedAt = new Date(todorantUserInfo.updatedAt)
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
export class LoginContent extends Component<{
  route: RouteProp<
    Record<string, { loginWall: boolean | undefined } | undefined>,
    string
  >
}> {
  vm = new LoginVM()

  render() {
    return (
      <Container>
        <Content style={{ padding: 10 }}>
          {this.props.route.params?.loginWall && (
            <View
              style={{
                justifyContent: 'center',
                flex: 1,
                alignItems: 'center',
                marginBottom: 16,
              }}
            >
              <Text style={{}}>{translate('loginWall')}</Text>
            </View>
          )}
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
            <Text>{translate('loginGoogle')}</Text>
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
            <Text>{translate('loginFacebook')}</Text>
          </Button>
        </Content>
      </Container>
    )
  }
}

export const Login = () => {
  const route = useRoute<
    RouteProp<
      Record<string, { loginWall: boolean | undefined } | undefined>,
      string
    >
  >()
  return <LoginContent route={route} />
}
