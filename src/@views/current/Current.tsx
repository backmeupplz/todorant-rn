import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import { Observer } from 'mobx-react'
import { translate } from '@utils/i18n'
import { sharedColors } from '@utils/sharedColors'
import { InfoButton } from '@views/settings/InfoButton'
import { sharedSettingsStore } from '@stores/SettingsStore'
import { CurrentContent } from '@views/current/CurrentContent'
import { headerBackButtonProps } from '@utils/headerBackButton'
import { HeroButton } from '@views/current/HeroButton'

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
              headerLeft: sharedSettingsStore.gamificationOn
                ? HeroButton()
                : undefined,
              headerRight: InfoButton('infoCurrent'),
              ...headerBackButtonProps(),
            }}
          />
        </Stack.Navigator>
      )}
    </Observer>
  )
}
