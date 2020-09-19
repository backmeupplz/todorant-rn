import React, { Component } from 'react'
import { Container, Content, Text, View, Input } from 'native-base'
import { Spinner } from '@components/Spinner'
import { GoogleSignin } from '@react-native-community/google-signin'
import { alertError } from '@utils/alert'
import * as rest from '@utils/rest'
import { sharedSessionStore } from '@stores/SessionStore'
import { goBack, navigate } from '@utils/navigation'
import { observable } from 'mobx'
import { observer } from 'mobx-react'
import { AccessToken, LoginManager } from 'react-native-fbsdk'
import { RouteProp, useRoute } from '@react-navigation/native'
import { translate } from '@utils/i18n'
import { sharedColors } from '@utils/sharedColors'
import { Platform } from 'react-native'
import appleAuth, {
  AppleButton,
} from '@invertase/react-native-apple-authentication'
import { syncEventEmitter } from '@utils/sockets'
import { Button } from '@components/Button'

class LoginVM {
  @observable loading = false
  @observable syncLoading = false
  @observable debugToken = ''

  constructor() {
    syncEventEmitter.addListener('todos_synced', () => {
      this.syncLoading = false
      syncEventEmitter.removeAllListeners()
      goBack()
    })
    syncEventEmitter.addListener('todos_sync_errored', (error) => {
      this.syncLoading = false
      syncEventEmitter.removeAllListeners()
      goBack()
      alertError(error)
    })
  }

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
      this.syncLoading = true
      sharedSessionStore.login(todorantUserInfo)
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
      this.syncLoading = true
      sharedSessionStore.login(todorantUserInfo)
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
        requestedOperation: appleAuth.Operation.LOGIN,
        requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
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
        this.syncLoading = true
        sharedSessionStore.login(todorantUserInfo)
      } else {
        throw new Error()
      }
    } catch (error) {
      alertError(translate('appleSigninError'))
    } finally {
      this.loading = false
    }
  }

  loginWithToken = async (token: string) => {
    this.loading = true
    try {
      const todorantUserInfo = (await rest.loginToken(token)).data
      todorantUserInfo.createdAt = new Date(todorantUserInfo.createdAt)
      todorantUserInfo.updatedAt = new Date(todorantUserInfo.updatedAt)
      this.syncLoading = true
      sharedSessionStore.login(todorantUserInfo)
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
      <>
        <Container>
          <Content
            style={{
              padding: 10,
              backgroundColor: sharedColors.backgroundColor,
            }}
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
                borderRadius: 10,
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
                borderRadius: 10,
              }}
              onPress={this.vm.loginWithFacebook}
              disabled={this.vm.loading}
            >
              <Text>{translate('loginFacebook')}</Text>
            </Button>
            {Platform.OS === 'ios' && (
              <View style={{ paddingBottom: 10 }}>
                <AppleButton
                  cornerRadius={10}
                  style={{
                    height: 50,
                    flex: 1,
                  }}
                  buttonStyle={AppleButton.Style.BLACK}
                  buttonType={AppleButton.Type.SIGN_IN}
                  onPress={this.vm.loginWithApple}
                />
              </View>
            )}
            <Button
              style={{
                justifyContent: 'center',
                backgroundColor: 'dodgerblue',
                marginBottom: 10,
                borderRadius: 10,
              }}
              onPress={() => {
                navigate('LoginTelegram', {
                  setLoadingToTrue: () => {
                    this.vm.syncLoading = true
                  },
                })
              }}
              disabled={this.vm.loading}
            >
              <Text>{translate('loginTelegram')}</Text>
            </Button>
            <Button
              style={{
                justifyContent: 'center',
                backgroundColor: 'darkslateblue',
                marginBottom: 10,
                borderRadius: 10,
              }}
              onPress={() => {
                navigate('LoginQR', {
                  getToken: (token: string) => {
                    this.vm.loginWithToken(token)
                  },
                })
              }}
              disabled={this.vm.loading}
            >
              <Text>{translate('loginQR')}</Text>
            </Button>
            {__DEV__ && (
              <>
                <Input
                  value={this.vm.debugToken}
                  onChangeText={(value) => {
                    this.vm.debugToken = value
                  }}
                  style={{
                    color: sharedColors.textColor,
                  }}
                  placeholder="Enter token here"
                  placeholderTextColor={sharedColors.placeholderColor}
                />
                <Button
                  style={{
                    justifyContent: 'center',
                    backgroundColor: 'darkslateblue',
                    marginBottom: 10,
                    borderRadius: 10,
                  }}
                  onPress={() => {
                    this.vm.loginWithToken(this.vm.debugToken)
                  }}
                  disabled={this.vm.loading}
                >
                  <Text>Login with token</Text>
                </Button>
              </>
            )}
          </Content>
        </Container>
        {this.vm.syncLoading && (
          <View
            style={{
              backgroundColor: 'black',
              position: 'absolute',
              top: 0,
              left: 0,
              flex: 1,
              height: '100%',
              width: '100%',
              opacity: 0.3,
              justifyContent: 'center',
              alignContent: 'center',
            }}
          >
            <Spinner />
            <Text
              style={{
                ...sharedColors.textExtraStyle.style,
                textAlign: 'center',
              }}
            >
              {translate('loadingData')}
            </Text>
          </View>
        )}
      </>
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
