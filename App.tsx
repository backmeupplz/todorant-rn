import React, { Component } from 'react'
import 'mobx-react-lite/batchingForReactNative'
import { NavigationContainer } from '@react-navigation/native'
import BottomTabNavigator from '@views/BottomTabNavigator'
import { navigationRef } from '@utils/navigation'
import { GoogleSignin } from '@react-native-community/google-signin'
import '@utils/network'
import '@utils/ignoreWarnings'
import '@utils/purchases'
import { Root, StyleProvider, View } from 'native-base'
import getTheme from './native-base-theme/components'
import { setI18nConfig, setI18nConfigAsync, translate } from '@utils/i18n'
import codePush from 'react-native-code-push'
import { observer } from 'mobx-react'
import { StatusBar, Platform } from 'react-native'
import { sharedColors } from '@utils/sharedColors'
import SplashScreen from 'react-native-splash-screen'
import { createStackNavigator } from '@react-navigation/stack'
import { AddTodo } from '@views/add/AddTodo'
import { AddButton } from '@components/AddButton'
import { InfoButton } from '@views/settings/InfoButton'
import { Login } from '@views/settings/Login'
import { Paywall } from '@views/settings/Paywall'
import { TermsOfUse } from '@views/settings/TermsOfUse'
import { PrivacyPolicy } from '@views/settings/PrivacyPolicy'
import { LoginTelegram } from '@views/settings/LoginTelegram'
import { IntroMessage } from '@views/settings/IntroMessage'

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

const Stack = createStackNavigator()

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
            <Stack.Navigator>
              <Stack.Screen
                name="BottomTabNavigator"
                component={BottomTabNavigator}
                options={{
                  headerShown: false,
                }}
              />
              <Stack.Screen
                name="AddTodo"
                component={AddTodo}
                options={{
                  title: translate('addTodo'),
                  ...sharedColors.headerExtraStyle,
                  headerRight: () => (
                    <View style={{ flexDirection: 'row' }}>
                      <AddButton />
                      {InfoButton('infoAdd')()}
                    </View>
                  ),
                }}
              />
              <Stack.Screen
                name="BreakdownTodo"
                component={AddTodo}
                options={{
                  title: translate('breakdownTodo'),
                  ...sharedColors.headerExtraStyle,
                  headerRight: () => (
                    <View style={{ flexDirection: 'row' }}>
                      <AddButton />
                      {InfoButton('infoBreakdown')()}
                    </View>
                  ),
                }}
              />
              <Stack.Screen
                name="EditTodo"
                component={AddTodo}
                options={{
                  title: translate('editTodo'),
                  ...sharedColors.headerExtraStyle,
                  headerRight: InfoButton('infoEdit'),
                }}
              />
              <Stack.Screen
                name="Login"
                component={Login}
                options={{
                  title: translate('pleaseLogin'),
                  headerTitleAlign: 'center',
                  ...sharedColors.headerExtraStyle,
                }}
              />
              <Stack.Screen
                name="Paywall"
                component={Paywall}
                options={{
                  title: translate('subscription'),
                  headerTitleAlign: 'center',
                  ...sharedColors.headerExtraStyle,
                }}
              />
              <Stack.Screen
                name="Terms"
                component={TermsOfUse}
                options={{
                  title: translate('termsOfUse'),
                  ...sharedColors.headerExtraStyle,
                }}
              />
              <Stack.Screen
                name="Privacy"
                component={PrivacyPolicy}
                options={{
                  title: translate('privacyPolicy'),
                  ...sharedColors.headerExtraStyle,
                }}
              />
              <Stack.Screen
                name="LoginTelegram"
                component={LoginTelegram}
                options={{
                  title: translate('loginTelegram'),
                  headerTitleAlign: 'center',
                  ...sharedColors.headerExtraStyle,
                }}
              />
              <Stack.Screen
                name="Intro"
                component={IntroMessage}
                options={{
                  title: translate('introTitle'),
                  headerTitleAlign: 'center',
                  ...sharedColors.headerExtraStyle,
                  headerRight: InfoButton('infoIntro'),
                }}
              />
            </Stack.Navigator>
          </NavigationContainer>
        </StyleProvider>
      </Root>
    )
  }
}

export default App
