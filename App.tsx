import 'react-native-get-random-values'
import { AddButton } from '@components/AddButton'
import {
  AppState,
  InteractionManager,
  Keyboard,
  LogBox,
  StatusBar,
  TouchableOpacity,
} from 'react-native'
import {
  CardStyleInterpolators,
  createStackNavigator,
} from '@react-navigation/stack'
import { Component } from 'react'
import { ConfettiView } from '@components/Confetti'
import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
} from '@react-navigation/native'
import { DayCompleteOverlay } from '@components/DayCompleteOverlay'
import { GoogleSignin } from '@react-native-google-signin/google-signin'
import { HeroProfile } from '@views/hero/HeroProfile'
import { Icon, Root, StyleProvider, Text, View } from 'native-base'
import { InfoButton } from '@components/InfoButton'
import { Login } from '@views/settings/Login/Login'
import { LoginTelegram } from '@views/settings/Login/LoginTelegram'
import { Observer, observer } from 'mobx-react'
import { Overlay, checkOnboardingStep } from '@views/onboarding/Overlay'
import { PrivacyPolicy } from '@views/settings/PrivacyPolicy'
import { RateModal } from '@components/RateModal'
import { Rules } from '@views/settings/Rules'
import {
  SafeAreaInsetsContext,
  SafeAreaProvider,
} from 'react-native-safe-area-context'
import { TermsOfUse } from '@views/settings/TermsOfUse'
import { TutorialStep } from '@stores/OnboardingStore/TutorialStep'
import { alertError } from '@utils/alert'
import { checkAndroidLaunchArgs } from '@utils/checkAndroidLaunchArgs'
import { checkAppVersion } from '@utils/checkAppVersion'
import { checkSharedContent } from '@utils/sharing'
import { checkSiriPermission } from '@utils/permissions'
import { checkTokenAndPassword } from '@utils/checkTokenAndPassword'
import { configure, when } from 'mobx'
import { enableScreens } from 'react-native-screens'
import { fixDuplicatedTasks, sharedSettingsStore } from '@stores/SettingsStore'
import { headerBackButtonProps } from '@utils/headerBackButton'
import { hydration } from '@stores/hydration/hydratedStores'
import { navigate, navigationRef } from '@utils/navigation'
import { refreshWidgetAndBadgeAndWatch } from '@utils/refreshWidgetAndBadgeAndWatch'
import { setI18nConfig, setI18nConfigAsync, translate } from '@utils/i18n'
import { setupAnalytics } from '@utils/logEvent'
import { setupLinking } from '@utils/linking'
import { sharedColors } from '@utils/sharedColors'
import { sharedDelegationStore } from '@stores/DelegationStore'
import { sharedHeroStore } from '@stores/HeroStore'
import { sharedOnboardingStore } from '@stores/OnboardingStore'
import { sharedSessionStore } from '@stores/SessionStore'
import { sharedSync } from '@sync/Sync'
import { sharedTodoStore } from '@stores/TodoStore'
import AddTodo from '@views/add/AddTodo'
import BottomTabNavigator from '@views/BottomTabNavigator'
import React from 'react'
import SplashScreen from 'react-native-splash-screen'
import codePush from 'react-native-code-push'
// eslint-disable-next-line no-relative-import-paths/no-relative-import-paths
import getTheme from './native-base-theme/components'

enableScreens(false)

sharedDelegationStore

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
})

LogBox.ignoreAllLogs()

const Stack = createStackNavigator()

@codePush(CodePushOptions)
@observer
class App extends Component {
  async componentDidMount() {
    await fixDuplicatedTasks()
    await setI18nConfigAsync()
    checkTokenAndPassword()
    checkSiriPermission()
    checkSharedContent()
    setupLinking()
    checkAndroidLaunchArgs()
    setupAnalytics()
    await when(() => hydration.isHydrated)
    if (!sharedSessionStore.localMigrationCompleted) {
      try {
        sharedSessionStore.localMigrationCompleted = true
      } catch (err) {
        alertError('A error occur while transfering data between databases')
        alertError(err as string)
      }
    }
    if (!sharedSessionStore.exactDatesRecalculated) {
      try {
        await sharedTodoStore.recalculateExactDates()
        sharedSessionStore.exactDatesRecalculated = true
      } catch (err) {
        alertError('A error occur while recalculating exact date at')
        alertError(err as string)
      }
    }
    AppState.addEventListener('change', (nextState) => {
      sharedSync.globalSync()
      if (nextState === 'active') {
        checkAndroidLaunchArgs()
      }
    })
    checkOnboardingStep()
    refreshWidgetAndBadgeAndWatch()
  }

  render() {
    // Hack to make this reactive
    return (
      <SafeAreaProvider>
        <Root ref={(ref) => (rootRef = ref)}>
          <NavigationContainer
            ref={navigationRef}
            theme={sharedSettingsStore.isDark ? DarkTheme : DefaultTheme}
          >
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
                  detachPreviousScreen: false,
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
              </Stack.Navigator>
            </StyleProvider>
            {/* <DayCompleteOverlay /> */}
            <ConfettiView />
          </NavigationContainer>
        </Root>
      </SafeAreaProvider>
    )
  }
}

export default App
