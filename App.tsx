import 'react-native-get-random-values'
import {
  AppState,
  Keyboard,
  LogBox,
  StatusBar,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
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
import { Icon, Root, StyleProvider } from 'native-base'
import { Observer, observer } from 'mobx-react'
import { RateModal } from '@components/RateModal'
import {
  SafeAreaInsetsContext,
  SafeAreaProvider,
} from 'react-native-safe-area-context'
import { configure, when } from 'mobx'
import { enableScreens } from 'react-native-screens'
import { fixDuplicatedTasks, sharedSettingsStore } from '@stores/SettingsStore'
import { headerBackButtonProps } from '@utils/headerBackButton'
import { setI18nConfig, setI18nConfigAsync, translate } from '@utils/i18n'
import { sharedColors } from '@utils/sharedColors'
import { sharedDelegationStore } from '@stores/DelegationStore'
import { useEffect, useRef } from 'react'
import BottomTabNavigator from '@views/BottomTabNavigator'
import React from 'react'
import codePush from 'react-native-code-push'
// eslint-disable-next-line no-relative-import-paths/no-relative-import-paths
import { AddButton } from '@components/AddButton'
import { DayCompleteOverlay } from '@components/DayCompleteOverlay'
import { InfoButton } from '@components/InfoButton'
import { Login } from '@views/settings/Login/Login'
import { LoginTelegram } from '@views/settings/Login/LoginTelegram'
import { Overlay, checkOnboardingStep } from '@views/onboarding/Overlay'
import { PrivacyPolicy } from '@views/settings/PrivacyPolicy'
import { Rules } from '@views/settings/Rules'
import { TermsOfUse } from '@views/settings/TermsOfUse'
import { TutorialStep } from '@stores/OnboardingStore/TutorialStep'
import { alertError } from '@utils/alert'
import { checkAndroidLaunchArgs } from '@utils/checkAndroidLaunchArgs'
import { checkSharedContent } from '@utils/sharing'
import { checkSiriPermission } from '@utils/permissions'
import { checkTokenAndPassword } from '@utils/checkTokenAndPassword'
import { hydration } from '@stores/hydration/hydratedStores'
import { navigationRef } from '@utils/navigation'
import { refreshWidgetAndBadgeAndWatch } from '@utils/refreshWidgetAndBadgeAndWatch'
import { setupAnalytics } from '@utils/logEvent'
import { setupLinking } from '@utils/linking'
import { sharedHeroStore } from '@stores/HeroStore'
import { sharedOnboardingStore } from '@stores/OnboardingStore'
import { sharedSessionStore } from '@stores/SessionStore'
import { sharedSync } from '@sync/Sync'
import { sharedTodoStore } from '@stores/TodoStore'
import AddTodo from '@views/add/AddTodo'
import HeroProfile from '@views/hero/HeroProfile'
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
    init()
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
    </SafeAreaProvider>
  )
})

export default App
