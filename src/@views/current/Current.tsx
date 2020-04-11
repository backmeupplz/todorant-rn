import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import { View } from 'native-base'
import { AddTodo } from '@views/add/AddTodo'
import { Observer } from 'mobx-react'
import { Login } from '@views/settings/Login'
import { Paywall } from '@views/settings/Paywall'
import { translate } from '@utils/i18n'
import { sharedColors } from '@utils/sharedColors'
import { TermsOfUse } from '@views/settings/TermsOfUse'
import { PrivacyPolicy } from '@views/settings/PrivacyPolicy'
import { LoginTelegram } from '@views/settings/LoginTelegram'
import { IntroMessage } from '@views/settings/IntroMessage'
import { InfoButton } from '@views/settings/InfoButton'
import { sharedSettingsStore } from '@stores/SettingsStore'
import { AddButton } from '@components/AddButton'
import { CurrentContent } from '@views/current/CurrentContent'

const Stack = createStackNavigator()

export function Current() {
  return (
    <Observer>
      {() => (
        <Stack.Navigator
          {...({ language: sharedSettingsStore.language } as any)}
        >
          <Stack.Screen
            name="Current"
            component={CurrentContent}
            options={{
              title: translate('current'),
              ...sharedColors.headerExtraStyle,
              headerRight: InfoButton('infoCurrent'),
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
      )}
    </Observer>
  )
}
