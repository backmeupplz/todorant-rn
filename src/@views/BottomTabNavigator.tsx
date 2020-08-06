import React from 'react'
import { Settings } from '@views/settings/Settings'
import { Planning } from '@views/planning/Planning'
import { Current } from '@views/current/Current'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { View } from 'native-base'
import { sharedSessionStore } from '@stores/SessionStore'
import { sharedTodoStore } from '@stores/TodoStore'
import { observer } from 'mobx-react'
import { translate } from '@utils/i18n'
import { sharedColors } from '@utils/sharedColors'
import { sharedSettingsStore } from '@stores/SettingsStore'
import { sharedAppStateStore } from '@stores/AppStateStore'
import fonts from '@utils/fonts'
import CurrentIcon from '@assets/images/current'
import CurrentActiveIcon from '@assets/images/current-active'
import PlanningIcon from '@assets/images/planning'
import PlanningActiveIcon from '@assets/images/planning-active'
import SettingsIcon from '@assets/images/settings'
import SettingsActiveIcon from '@assets/images/settings-active'

const Tab = createBottomTabNavigator()

export default observer(() => {
  // Hack to make this reactive
  let languageTag = sharedAppStateStore.languageTag
  languageTag = `${languageTag}`

  return (
    <>
      <Tab.Navigator
        {...({ language: sharedSettingsStore.language } as any)}
        backBehavior="none"
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, size }) => {
            let name = 'current'
            let icon = focused ? CurrentActiveIcon({}) : CurrentIcon({})
            if (route.name === 'Planning') {
              name = 'planning'
              icon = focused
                ? PlanningActiveIcon({ width: size, height: size })
                : PlanningIcon({ width: size, height: size })
            } else if (route.name === 'Settings') {
              name = 'settings'
              icon = focused
                ? SettingsActiveIcon({ width: size, height: size })
                : SettingsIcon({ width: size, height: size })
            }
            return (
              <View accessibilityLabel={name} testID={name} accessible>
                <View accessible={false}>
                  {icon}
                  {route.name === 'Settings' && !sharedSessionStore.user && (
                    <View
                      style={{
                        position: 'absolute',
                        width: 6,
                        height: 6,
                        backgroundColor: 'red',
                        top: 0,
                        right: 0,
                        borderRadius: 3,
                      }}
                    />
                  )}
                </View>
              </View>
            )
          },
        })}
        tabBarOptions={{
          activeTintColor: sharedColors.primaryColor,
          inactiveTintColor: 'gray',
          style: {
            backgroundColor: sharedColors.backgroundColor,
            borderTopColor: sharedColors.borderColor,
          },
          labelStyle: {
            fontFamily: fonts.SFProTextRegular,
          },
          tabStyle: {
            paddingTop: 6,
          },
        }}
      >
        {!sharedTodoStore.isPlanningRequired && (
          <Tab.Screen
            name="Current"
            component={Current}
            options={{ title: translate('current') }}
          />
        )}
        <Tab.Screen
          name="Planning"
          component={Planning}
          options={{ title: translate('planning') }}
        />
        <Tab.Screen
          name="Delegation"
          component={Settings}
          options={{ title: translate('settings') }}
        />
        <Tab.Screen
          name="Settings"
          component={Settings}
          options={{ title: translate('settings') }}
        />
      </Tab.Navigator>
    </>
  )
})
