import React, { Component } from 'react'
import { Text, View } from 'react-native'
import { createStackNavigator } from '@react-navigation/stack'

const Stack = createStackNavigator()

export class SettingsContent extends Component {
  render() {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Text>Settings</Text>
      </View>
    )
  }
}
export function Settings() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Settings" component={SettingsContent} />
    </Stack.Navigator>
  )
}
