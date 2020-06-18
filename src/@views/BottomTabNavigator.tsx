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
import SvgUri from 'react-native-svg-uri'

const Tab = createBottomTabNavigator()

const currentIcon = require('@assets/images/current.svg')
const currentIconActive = require('@assets/images/current-active.svg')
const planningIcon = require('@assets/images/planning.svg')
const planningIconActive = require('@assets/images/planning-active.svg')
const settingsIcon = require('@assets/images/settings.svg')
const settingsIconActive = require('@assets/images/settings-active.svg')

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
            let icon = focused ? currentIconActive : currentIcon
            if (route.name === 'Planning') {
              name = 'planning'
              icon = focused ? planningIconActive : planningIcon
            } else if (route.name === 'Settings') {
              name = 'settings'
              icon = focused ? settingsIconActive : settingsIcon
            }
            return (
              <View accessibilityLabel={name} testID={name} accessible>
                <View accessible={false}>
                  <SvgUri width={size} height={size} source={icon} />
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
            fontFamily: 'SF-Pro-Text-Regular',
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
          name="Settings"
          component={Settings}
          options={{ title: translate('settings') }}
        />
      </Tab.Navigator>
    </>
  )
})
