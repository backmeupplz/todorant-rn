import React, { Component } from 'react'
import { View } from 'react-native'
import { MessageBox } from '@views/onboarding/MessageBox'
import { RNHoleView } from 'react-native-hole-view'

export class Overlay extends Component {
  render() {
    return (
      <View
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          bottom: 0,
          left: 0,
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 12,
        }}
      >
        <RNHoleView
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
          }}
        />
        <MessageBox />
      </View>
    )
  }
}
