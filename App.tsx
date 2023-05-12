import 'react-native-get-random-values'
import { AppState, LogBox, StatusBar } from 'react-native'
import {
  CardStyleInterpolators,
  createStackNavigator,
} from '@react-navigation/stack'
import { ConfettiView } from '@components/Confetti'
import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
} from '@react-navigation/native'
import { GoogleSignin } from '@react-native-google-signin/google-signin'
import { RateModal } from '@components/RateModal'
import { Root, StyleProvider } from 'native-base'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { configure, when } from 'mobx'
import { enableScreens } from 'react-native-screens'
import { fixDuplicatedTasks, sharedSettingsStore } from '@stores/SettingsStore'
import { headerBackButtonProps } from '@utils/headerBackButton'
import { observer } from 'mobx-react'
import { setI18nConfig, setI18nConfigAsync } from '@utils/i18n'
import { sharedColors } from '@utils/sharedColors'
import { sharedDelegationStore } from '@stores/DelegationStore'
import { useEffect, useRef } from 'react'
import BottomTabNavigator from '@views/BottomTabNavigator'
import React from 'react'
import codePush from 'react-native-code-push'
// eslint-disable-next-line no-relative-import-paths/no-relative-import-paths
import { alertError } from '@utils/alert'
import { checkAndroidLaunchArgs } from '@utils/checkAndroidLaunchArgs'
import { checkOnboardingStep } from '@views/onboarding/Overlay'
import { checkSharedContent } from '@utils/sharing'
import { checkSiriPermission } from '@utils/permissions'
import { checkTokenAndPassword } from '@utils/checkTokenAndPassword'
import { hydration } from '@stores/hydration/hydratedStores'
import { refreshWidgetAndBadgeAndWatch } from '@utils/refreshWidgetAndBadgeAndWatch'
import { setupAnalytics } from '@utils/logEvent'
import { setupLinking } from '@utils/linking'
import { sharedSessionStore } from '@stores/SessionStore'
import { sharedSync } from '@sync/Sync'
import { sharedTodoStore } from '@stores/TodoStore'
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

const App = observer(() => {
  const navigationRef = useRef()

  useEffect(() => {
    async function init() {
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
  })

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
          <ConfettiView />
        </NavigationContainer>
      </Root>
    </SafeAreaProvider>
  )
})

export default App
