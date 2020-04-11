import React, { Component } from 'react'
import 'mobx-react-lite/batchingForReactNative'
import { NavigationContainer } from '@react-navigation/native'
import BottomTabNavigator from './src/@views/BottomTabNavigator'
import { navigationRef } from './src/@utils/navigation'
import { GoogleSignin } from '@react-native-community/google-signin'
import '@utils/network'
import '@utils/ignoreWarnings'
import '@utils/purchases'
import { Root, StyleProvider } from 'native-base'
import getTheme from './native-base-theme/components'
import { setI18nConfig, setI18nConfigAsync } from '@utils/i18n'
import codePush from 'react-native-code-push'
import { observer } from 'mobx-react'
import { StatusBar, Platform } from 'react-native'
import { sharedColors } from '@utils/sharedColors'
import SplashScreen from 'react-native-splash-screen'

const CodePushOptions = {
  checkFrequency: codePush.CheckFrequency.ON_APP_RESUME,
  installMode: __DEV__
    ? codePush.InstallMode.ON_NEXT_RESTART
    : codePush.InstallMode.IMMEDIATE,
}

setI18nConfig()

GoogleSignin.configure({
  webClientId:
    '989382323327-rou6lmk2umbnoaq55493v1kqm8fvp22q.apps.googleusercontent.com',
  offlineAccess: true,
  forceConsentPrompt: true,
})

console.disableYellowBox = true

@codePush(CodePushOptions)
@observer
class App extends Component {
  async componentDidMount() {
    await setI18nConfigAsync()
    SplashScreen.hide()
  }

  render() {
    return (
      <Root>
        <StyleProvider style={getTheme()}>
          <NavigationContainer ref={navigationRef}>
            <StatusBar
              backgroundColor={sharedColors.backgroundColor}
              barStyle={
                Platform.OS === 'android'
                  ? sharedColors.isDark
                    ? 'light-content'
                    : 'dark-content'
                  : undefined
              }
            />
            <BottomTabNavigator />
          </NavigationContainer>
        </StyleProvider>
      </Root>
    )
  }
}

export default App
