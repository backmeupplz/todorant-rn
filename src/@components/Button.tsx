import React, { Component, ReactNode } from 'react'
import {
  Button as NativeBaseButton,
  View,
  NativeBase,
  RnViewStyleProp,
} from 'native-base'
import { Platform, StyleSheet, ViewStyle } from 'react-native'

const fixStyle = (style: any) => {
  if (style.backgroundColor) return style
  delete style.backgroundColor
  return style
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
        <NativeBaseButton
          {...this.props}
          {...{ style: fixStyle(this.props.style) }}
        />
      </View>
    ) : (
      <NativeBaseButton
        {...this.props}
        {...{ style: fixStyle(this.props.style) }}
      />
    )
  }
}
