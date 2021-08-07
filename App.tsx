import React, { Component } from 'react'
import { NavigationContainer } from '@react-navigation/native'
import BottomTabNavigator from '@views/BottomTabNavigator'
import { navigate, navigationRef } from '@utils/navigation'
import { GoogleSignin } from '@react-native-community/google-signin'
import '@utils/purchases'
import { Icon, Root, StyleProvider, Text, View } from 'native-base'
import getTheme from './native-base-theme/components'
import { setI18nConfig, setI18nConfigAsync, translate } from '@utils/i18n'
import codePush from 'react-native-code-push'
import { Observer, observer } from 'mobx-react'
import {
  StatusBar,
  LogBox,
  AppState,
  TouchableOpacity,
  Keyboard,
  InteractionManager,
} from 'react-native'
import { sharedColors } from '@utils/sharedColors'
import SplashScreen from 'react-native-splash-screen'
import {
  CardStyleInterpolators,
  createStackNavigator,
} from '@react-navigation/stack'
import { AddTodo } from '@views/add/AddTodo'
import { AddButton } from '@components/AddButton'
import { InfoButton } from '@components/InfoButton'
import { Login } from '@views/settings/Login/Login'
import { Paywall } from '@views/settings/Paywall'
import { TermsOfUse } from '@views/settings/TermsOfUse'
import { PrivacyPolicy } from '@views/settings/PrivacyPolicy'
import { LoginTelegram } from '@views/settings/Login/LoginTelegram'
import { headerBackButtonProps } from '@utils/headerBackButton'
import { RateModal } from '@components/RateModal'
import { sharedAppStateStore } from '@stores/AppStateStore'
import { ConfettiView } from '@components/Confetti'
import { DayCompleteOverlay } from '@components/DayCompleteOverlay'
import { checkOnboardingStep, Overlay } from '@views/onboarding/Overlay'
import { HeroProfile } from '@views/hero/HeroProfile'
import { sharedHeroStore } from '@stores/HeroStore'
import { checkTokenAndPassword } from '@utils/checkTokenAndPassword'
import { checkSiriPermission } from '@utils/permissions'
import { checkSharedContent } from '@utils/sharing'
import { refreshWidgetAndBadgeAndWatch } from '@utils/refreshWidgetAndBadgeAndWatch'
import { Rules } from '@views/settings/Rules'
import { setupLinking } from '@utils/linking'
import { checkAndroidLaunchArgs } from '@utils/checkAndroidLaunchArgs'
import { setupAnalytics } from '@utils/logEvent'
import { sharedSettingsStore } from '@stores/SettingsStore'
import { configure, when } from 'mobx'
import { checkupVersion } from '@utils/checkupVersion'
import { sharedOnboardingStore } from '@stores/OnboardingStore'
import { TutorialStep } from '@stores/OnboardingStore/TutorialStep'
import { SafeAreaInsetsContext } from 'react-native-safe-area-context'
import { hydration } from '@stores/hydration/hydratedStores'
import { migrateRealmToWMDB } from '@utils/realm'
import { alertError } from '@utils/alert'
import { sharedSessionStore } from '@stores/SessionStore'

export let rootRef: any
export let closeOnboardingButtonNode: number

const CodePushOptions = {
  checkFrequency: codePush.CheckFrequency.ON_APP_RESUME,
  installMode: __DEV__
    ? codePush.InstallMode.ON_NEXT_RESTART
    : codePush.InstallMode.IMMEDIATE,
}

configure({
  enforceActions: 'never',
})

setI18nConfig()

GoogleSignin.configure({
  webClientId:
    '989382323327-rou6lmk2umbnoaq55493v1kqm8fvp22q.apps.googleusercontent.com',
  offlineAccess: true,
  forceConsentPrompt: true,
})

LogBox.ignoreAllLogs()

const Stack = createStackNavigator()

@codePush(CodePushOptions)
@observer
class App extends Component {
  async componentDidMount() {
    await setI18nConfigAsync()
    checkTokenAndPassword()
    checkSiriPermission()
    checkSharedContent()
    refreshWidgetAndBadgeAndWatch()
    setupLinking()
    checkAndroidLaunchArgs()
    setupAnalytics()
    checkupVersion()
    AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        checkAndroidLaunchArgs()
      }
    })
    await when(() => hydration.isHydrated)
    if (!sharedSessionStore.migrationCompleted) {
      try {
        await migrateRealmToWMDB()
        sharedSessionStore.migrationCompleted = true
      } catch (err) {
        alertError('A error occur while transfering data between databases')
        alertError(err)
      }
    }
    SplashScreen.hide()
    checkOnboardingStep()
  }

  render() {
    // Hack to make this reactive
    return (
      <Root ref={(ref) => (rootRef = ref)}>
        <NavigationContainer ref={navigationRef}>
          <StatusBar
            backgroundColor={sharedColors.backgroundColor}
            barStyle={
              sharedSettingsStore.isDark ? 'light-content' : 'dark-content'
            }
          />
          <RateModal />
          <StyleProvider
            style={{
              ...getTheme(),
              pointerEvent: 'box-none',
            }}
          >
            <Stack.Navigator
              screenOptions={{
                cardStyleInterpolator: CardStyleInterpolators.forVerticalIOS,
              }}
            >
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
                    <Observer>
                      {() => (
                        <View
                          pointerEvents={
                            sharedOnboardingStore.tutorialIsShown
                              ? 'auto'
                              : 'none'
                          }
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                          }}
                        >
                          <AddButton />
                          {InfoButton('infoAdd')()}
                        </View>
                      )}
                    </Observer>
                  ),
                  ...headerBackButtonProps(true),
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
              <Stack.Screen
                name="Rules"
                component={Rules}
                options={{
                  title: translate('howTo'),
                  ...sharedColors.headerExtraStyle,
                  headerRight: InfoButton('infoRules'),
                  ...headerBackButtonProps(),
                }}
              />
            </Stack.Navigator>
          </StyleProvider>
          <DayCompleteOverlay />
          <ConfettiView />
        </NavigationContainer>
        <Overlay />
        {!sharedOnboardingStore.tutorialIsShown &&
          !sharedOnboardingStore.stepObject.notShowClose && (
            <SafeAreaInsetsContext.Consumer>
              {(insets) => {
                return (
                  <TouchableOpacity
                    style={[
                      sharedOnboardingStore.closeOnboardingStyle,
                      { marginTop: insets?.top },
                    ]}
                    onPress={() => {
                      Keyboard.dismiss()
                      sharedOnboardingStore.nextStep(TutorialStep.Close)
                    }}
                  >
                    {/* A quick hack to make insets reactive on iOS, I have no idea why this works */}
                    <Text style={{ opacity: 0, fontSize: 0 }}>
                      {insets?.top || 'none'}
                    </Text>
                    <Icon
                      type="MaterialIcons"
                      name="close"
                      style={{
                        color: 'white',
                        fontSize: 48,
                      }}
                    />
                  </TouchableOpacity>
                )
              }}
            </SafeAreaInsetsContext.Consumer>
          )}
      </Root>
    )
  }
}

export default App
