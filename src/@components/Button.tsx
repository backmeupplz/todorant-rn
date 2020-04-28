import React, { Component } from 'react'
import { Button as NativeBaseButton, View, NativeBase } from 'native-base'
import { Platform } from 'react-native'

export class Button extends Component<NativeBase.Button> {
  render() {
    return Platform.OS === 'android' ? (
      <View
        style={{
          overflow: 'hidden',
          width: this.props.block ? '100%' : undefined,
        }}
        removeClippedSubviews
      >
        <NativeBaseButton {...this.props} />
      </View>
    ) : (
      <NativeBaseButton {...this.props} />
    )
  }
}
