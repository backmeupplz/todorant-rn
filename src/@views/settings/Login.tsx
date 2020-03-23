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
import { sharedColors } from '@utils/sharedColors'
import { Platform } from 'react-native'
import appleAuth, {
  AppleButton,
  AppleAuthRequestOperation,
  AppleAuthRequestScope,
} from '@invertase/react-native-apple-authentication'

class LoginVM {
  @observable loading = false

  loginWithGoogle = async () => {
    this.loading = true
    try {
      await GoogleSignin.hasPlayServices()
      if (await GoogleSignin.isSignedIn()) {
        await GoogleSignin.signOut()
      }
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

  loginWithApple = async () => {
    this.loading = true
    try {
      const appleAuthRequestResponse = await appleAuth.performRequest({
        requestedOperation: AppleAuthRequestOperation.LOGIN,
        requestedScopes: [
          AppleAuthRequestScope.EMAIL,
          AppleAuthRequestScope.FULL_NAME,
        ],
      })

      if (appleAuthRequestResponse.authorizationCode) {
        const todorantUserInfo = (
          await rest.loginApple(
            appleAuthRequestResponse.authorizationCode,
            typeof appleAuthRequestResponse.user === 'string'
              ? undefined
              : appleAuthRequestResponse.user
          )
        ).data
        todorantUserInfo.createdAt = new Date(todorantUserInfo.createdAt)
        todorantUserInfo.updatedAt = new Date(todorantUserInfo.updatedAt)
        sharedSessionStore.login(todorantUserInfo)
        goBack()
      } else {
        throw new Error()
      }
    } catch (error) {
      alertError(translate('appleSigninError'))
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
        <Content
          style={{ padding: 10, backgroundColor: sharedColors.backgroundColor }}
        >
          {this.props.route.params?.loginWall && (
            <View
              style={{
                justifyContent: 'center',
                flex: 1,
                alignItems: 'center',
                marginBottom: 16,
              }}
            >
              <Text {...sharedColors.textExtraStyle}>
                {translate('loginWall')}
              </Text>
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
          {Platform.OS === 'ios' && (
            <AppleButton
              cornerRadius={5}
              style={{
                height: 50,
                flex: 1,
              }}
              buttonStyle={AppleButton.Style.BLACK}
              buttonType={AppleButton.Type.SIGN_IN}
              onPress={this.vm.loginWithApple}
            />
          )}
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
