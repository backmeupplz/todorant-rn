import React, { Component } from 'react'
import { Text, View } from 'react-native'

export class Current extends Component {
  render() {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Text>Current</Text>
      </View>
    )
  }
}
