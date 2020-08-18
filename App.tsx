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
import { StatusBar } from 'react-native'
import { sharedColors } from '@utils/sharedColors'
import SplashScreen from 'react-native-splash-screen'
import { createStackNavigator } from '@react-navigation/stack'
import { AddTodo } from '@views/add/AddTodo'
import { AddButton } from '@components/AddButton'
import { InfoButton } from '@components/InfoButton'
import { Login } from '@views/settings/Login/Login'
import { Paywall } from '@views/settings/Paywall'
import { TermsOfUse } from '@views/settings/TermsOfUse'
import { PrivacyPolicy } from '@views/settings/PrivacyPolicy'
import { LoginTelegram } from '@views/settings/Login/LoginTelegram'
import { IntroMessage } from '@views/settings/IntroMessage'
import { headerBackButtonProps } from '@utils/headerBackButton'
import { RateModal } from '@components/RateModal'
import { sharedAppStateStore } from '@stores/AppStateStore'
import { ConfettiView } from '@components/Confetti'
import { DayCompleteOverlay } from '@components/DayCompleteOverlay'
import { HeroProfile } from '@views/hero/HeroProfile'
import { sharedHeroStore } from '@stores/HeroStore'
import { BackButton } from '@components/BackButton'

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
    // Hack to make this reactive
    let languageTag = sharedAppStateStore.languageTag
    languageTag = `${languageTag}`

    return (
      <Root>
        <NavigationContainer ref={navigationRef}>
          <StatusBar
            backgroundColor={sharedColors.backgroundColor}
            barStyle={sharedColors.isDark ? 'light-content' : 'dark-content'}
          />
          <RateModal />
          <StyleProvider style={getTheme()}>
            <Stack.Navigator>
              <Stack.Screen
                name="BottomTabNavigator"
                component={BottomTabNavigator}
                options={{
                  headerShown: false,
                  ...headerBackButtonProps(),
                }}
              />
              <Stack.Screen
                name="AddTodo"
                component={AddTodo}
                options={{
                  title: translate('addTodo'),
                  ...sharedColors.headerExtraStyle,
                  headerRight: () => (
                    <View
                      style={{ flexDirection: 'row', alignItems: 'center' }}
                    >
                      <AddButton />
                      {InfoButton('infoAdd')()}
                    </View>
                  ),
                  headerLeft: () => (
                    <View style={{ flexDirection: 'row'}}>
                      <BackButton/>
                    </View>
                  ),
                  ...headerBackButtonProps(),
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
                  ...headerBackButtonProps(),
                }}
              />
              <Stack.Screen
                name="EditTodo"
                component={AddTodo}
                options={{
                  title: translate('editTodo'),
                  ...sharedColors.headerExtraStyle,
                  headerRight: InfoButton('infoEdit'),
                  ...headerBackButtonProps(),
                }}
              />
              <Stack.Screen
                name="Login"
                component={Login}
                options={{
                  title: translate('pleaseLogin'),
                  headerTitleAlign: 'center',
                  ...sharedColors.headerExtraStyle,
                  ...headerBackButtonProps(),
                }}
              />
              <Stack.Screen
                name="Paywall"
                component={Paywall}
                options={{
                  title: translate('subscription'),
                  headerTitleAlign: 'center',
                  ...sharedColors.headerExtraStyle,
                  ...headerBackButtonProps(),
                }}
              />
              <Stack.Screen
                name="Terms"
                component={TermsOfUse}
                options={{
                  title: translate('termsOfUse'),
                  ...sharedColors.headerExtraStyle,
                  ...headerBackButtonProps(),
                }}
              />
              <Stack.Screen
                name="Privacy"
                component={PrivacyPolicy}
                options={{
                  title: translate('privacyPolicy'),
                  ...sharedColors.headerExtraStyle,
                  ...headerBackButtonProps(),
                }}
              />
              <Stack.Screen
                name="LoginTelegram"
                component={LoginTelegram}
                options={{
                  title: translate('loginTelegram'),
                  headerTitleAlign: 'center',
                  ...sharedColors.headerExtraStyle,
                  ...headerBackButtonProps(),
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
                  ...headerBackButtonProps(),
                }}
              />
              <Stack.Screen
                name="HeroProfile"
                component={HeroProfile}
                options={{
                  title: translate('heroProfileTitle'),
                  headerTitleAlign: 'center',
                  ...sharedColors.headerExtraStyle,
                  headerRight: InfoButton(
                    'infoHero',
                    undefined,
                    sharedHeroStore.rankColor[2]
                  ),
                  ...headerBackButtonProps(),
                }}
              />
            </Stack.Navigator>
          </StyleProvider>
          <DayCompleteOverlay />
          <ConfettiView />
        </NavigationContainer>
      </Root>
    )
  }
}

export default App
