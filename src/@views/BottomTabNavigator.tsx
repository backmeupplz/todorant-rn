import React from 'react'
import { Settings } from './settings/Settings'
import { Planning } from './planning/Planning'
import { Current } from './current/Current'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Icon } from 'native-base'

const Tab = createBottomTabNavigator()

export default function BottomTabNavigator() {
  return (
    <>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let name = 'event-available'
            if (route.name === 'Planning') {
              name = 'list'
            } else if (route.name === 'Settings') {
              name = 'settings'
            }
            return (
              <Icon
                type="MaterialIcons"
                name={name}
                fontSize={size}
                style={{
                  color,
                }}
              />
            )
          },
        })}
        tabBarOptions={{
          activeTintColor: 'tomato',
          inactiveTintColor: 'gray',
        }}
      >
        <Tab.Screen name="Current" component={Current} />
        <Tab.Screen name="Planning" component={Planning} />
        <Tab.Screen name="Settings" component={Settings} />
      </Tab.Navigator>
    </>
  )
}
