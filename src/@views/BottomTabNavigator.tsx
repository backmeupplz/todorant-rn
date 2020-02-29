import React from 'react'
import { Settings } from './settings/Settings'
import { Planning } from './planning/Planning'
import { Current } from './current/Current'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { Icon, View } from 'native-base'
import { sharedSessionStore } from '@stores/SessionStore'
import { sharedTodoStore } from '@stores/TodoStore'
import { observer } from 'mobx-react'

const Tab = createBottomTabNavigator()

export default observer(function BottomTabNavigator() {
  return (
    <>
      <Tab.Navigator
        backBehavior="none"
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let name = 'event-available'
            if (route.name === 'Planning') {
              name = 'list'
            } else if (route.name === 'Settings') {
              name = 'settings'
            }
            return (
              <View>
                <Icon
                  type="MaterialIcons"
                  name={name}
                  fontSize={size}
                  style={{
                    color,
                  }}
                />
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
            )
          },
        })}
        tabBarOptions={{
          activeTintColor: 'tomato',
          inactiveTintColor: 'gray',
        }}
      >
        {!sharedTodoStore.isPlanningRequired && (
          <Tab.Screen name="Current" component={Current} />
        )}
        <Tab.Screen name="Planning" component={Planning} />
        <Tab.Screen name="Settings" component={Settings} />
      </Tab.Navigator>
    </>
  )
})
