import React, { Component } from 'react'
import { Button as NativeBaseButton, View, NativeBase } from 'native-base'
import { Platform } from 'react-native'

const removeFalsyElement = (object: any) => {
  if (object.style.backgroundColor) return object
  delete object.style.backgroundColor
  return object
}

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
        <NativeBaseButton {...removeFalsyElement(this.props)} />
      </View>
    ) : (
      <NativeBaseButton {...removeFalsyElement(this.props)} />
    )
  }
}
