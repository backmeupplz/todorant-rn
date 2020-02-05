import React, { Component } from 'react'
import { Text, View } from 'react-native'
import { createStackNavigator } from '@react-navigation/stack'

const Stack = createStackNavigator()

class PlanningContent extends Component {
  render() {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Text>Planning</Text>
      </View>
    )
  }
}

export function Planning() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Planning" component={PlanningContent} />
    </Stack.Navigator>
  )
}
