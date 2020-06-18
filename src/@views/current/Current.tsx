import React from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import { Observer } from 'mobx-react'
import { sharedSettingsStore } from '@stores/SettingsStore'
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
              headerShown: false,
            }}
          />
        </Stack.Navigator>
      )}
    </Observer>
  )
}
