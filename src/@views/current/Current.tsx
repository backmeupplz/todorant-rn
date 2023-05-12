import {
  CardStyleInterpolators,
  createStackNavigator,
} from '@react-navigation/stack'
import { CurrentContent } from '@views/current/CurrentContent'
import { Observer } from 'mobx-react'
import { sharedSettingsStore } from '@stores/SettingsStore'

const Stack = createStackNavigator()

export function Current() {
  return (
    <Observer>
      {() => (
        <Stack.Navigator
          screenOptions={{
            detachPreviousScreen: false,
            cardStyleInterpolator: CardStyleInterpolators.forVerticalIOS,
          }}
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
