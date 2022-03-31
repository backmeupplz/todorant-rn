import { NativeBase, Button as NativeBaseButton, View } from 'native-base'
import { Platform } from 'react-native'
import React, { PureComponent } from 'react'

const fixStyle = (style: any) => {
  if (style.backgroundColor) return style
  delete style.backgroundColor
  return style
}

export class Button extends PureComponent<NativeBase.Button> {
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
