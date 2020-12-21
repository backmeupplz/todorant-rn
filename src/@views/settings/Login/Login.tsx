import { Button } from '@components/Button'
import { Spinner } from '@components/Spinner'
import appleAuth, {
  appleAuthAndroid,
  AppleButton,
} from '@invertase/react-native-apple-authentication'
import { GoogleSignin } from '@react-native-community/google-signin'
import { RouteProp, useRoute } from '@react-navigation/native'
import { sharedSessionStore } from '@stores/SessionStore'
import { alertError } from '@utils/alert'
import { translate } from '@utils/i18n'
import { goBack, navigate } from '@utils/navigation'
import * as rest from '@utils/rest'
import { sharedColors } from '@utils/sharedColors'
import { observable } from 'mobx'
import { observer } from 'mobx-react'
import { Container, Content, Input, Text, View } from 'native-base'
import React, { Component } from 'react'
import { Platform, StyleProp, TextStyle } from 'react-native'
import { v4 as uuid } from 'uuid'

class LoginVM {
  @observable loading = false
  @observable syncLoading = false
  @observable debugToken = ''

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
      await sharedSessionStore.login(todorantUserInfo)
      goBack()
    } catch (error) {
      alertError(error)
    } finally {
      this.syncLoading = false
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
        await sharedSessionStore.login(todorantUserInfo)
        goBack()
      } else {
        throw new Error()
      }
    } catch (error) {
      alertError(translate('appleSigninError'))
    } finally {
      this.syncLoading = false
      this.loading = false
    }
  }

  loginWithAppleAndroid = async () => {
    const rawNonce = uuid()
    const state = uuid()

    appleAuthAndroid.configure({
      clientId: 'com.todorant.web',
      redirectUri: 'https://backend.todorant.com/apple',
      responseType: appleAuthAndroid.ResponseType.ALL,
      scope: appleAuthAndroid.Scope.ALL,
      nonce: rawNonce,
      state,
    })

    this.loading = true
    try {
      const response = await appleAuthAndroid.signIn()
      if (response.id_token) {
        const todorantUserInfo = (
          await rest.loginAppleAndroid(
            response.id_token,
            response.user?.name?.firstName
              ? `${response.user?.name?.firstName} ${response.user?.name?.lastName}`
              : undefined
          )
        ).data
        todorantUserInfo.createdAt = new Date(todorantUserInfo.createdAt)
        todorantUserInfo.updatedAt = new Date(todorantUserInfo.updatedAt)
        this.syncLoading = true
        await sharedSessionStore.login(todorantUserInfo)
        goBack()
      }
    } catch (err) {
      alertError(translate('appleSigninError'))
    } finally {
      this.syncLoading = false
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
      await sharedSessionStore.login(todorantUserInfo)
      goBack()
    } catch (error) {
      alertError(error)
    } finally {
      this.syncLoading = false
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
    const textStyle = {
      fontFamily: sharedColors.regularTextExtraStyle.style.fontFamily,
      textTransform: 'none',
      fontWeight: 'normal',
      fontSize: Platform.OS === 'ios' ? 19 : 17,
    } as StyleProp<TextStyle>
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
              textStyle={textStyle}
            >
              <Text style={textStyle} uppercase={false}>
                {translate('loginGoogle')}
              </Text>
            </Button>
            <Button
              style={{
                justifyContent: 'center',
                backgroundColor: 'cornflowerblue',
                marginBottom: 10,
                borderRadius: 10,
              }}
              onPress={() => {
                navigate('LoginFacebook', {
                  setLoadingToTrue: () => {
                    this.vm.syncLoading = true
                  },
                })
              }}
              disabled={this.vm.loading}
              textStyle={textStyle}
            >
              <Text style={textStyle} uppercase={false}>
                {translate('loginFacebook')}
              </Text>
            </Button>
            {(Platform.OS === 'ios' || appleAuthAndroid.isSupported) && (
              <View
                style={{
                  paddingBottom: 10,
                }}
              >
                <AppleButton
                  cornerRadius={10}
                  style={{
                    height: 50,
                    flex: 1,
                    width: '100%',
                  }}
                  textStyle={textStyle}
                  buttonStyle={AppleButton.Style.BLACK}
                  buttonType={AppleButton.Type.SIGN_IN}
                  onPress={
                    Platform.OS === 'ios'
                      ? this.vm.loginWithApple
                      : this.vm.loginWithAppleAndroid
                  }
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
              textStyle={textStyle}
            >
              <Text style={textStyle} uppercase={false}>
                {translate('loginTelegram')}
              </Text>
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
              textStyle={textStyle}
            >
              <Text style={textStyle} uppercase={false}>
                {translate('loginQR')}
              </Text>
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
                  textStyle={textStyle}
                >
                  <Text style={textStyle} uppercase={false}>
                    Login with token
                  </Text>
                </Button>
              </>
            )}
          </Content>
        </Container>
        {this.vm.syncLoading && (
          <View
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              position: 'absolute',
              top: 0,
              left: 0,
              bottom: 0,
              right: 0,
              justifyContent: 'center',
              alignContent: 'center',
            }}
          >
            <Spinner noBackgroundColor={true} />
            <Text
              style={{
                color: 'white',
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
