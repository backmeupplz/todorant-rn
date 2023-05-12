import 'react-native-get-random-values'
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
import { LogBox, StatusBar } from 'react-native'
import { RateModal } from '@components/RateModal'
import { Root, StyleProvider } from 'native-base'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { configure } from 'mobx'
import { enableScreens } from 'react-native-screens'
import { headerBackButtonProps } from '@utils/headerBackButton'
import { observer } from 'mobx-react'
import { setI18nConfig } from '@utils/i18n'
import { sharedColors } from '@utils/sharedColors'
import { sharedDelegationStore } from '@stores/DelegationStore'
import { sharedSettingsStore } from '@stores/SettingsStore'
import { useRef } from 'react'
import BottomTabNavigator from '@views/BottomTabNavigator'
import React from 'react'
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

const App = observer(() => {
  const navigationRef = useRef()

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
          <ConfettiView />
        </NavigationContainer>
      </Root>
    </SafeAreaProvider>
  )
})

export default App
