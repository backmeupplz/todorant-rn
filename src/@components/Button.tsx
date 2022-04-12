import { NativeBase, Button as NativeBaseButton, View } from 'native-base'
import { Platform } from 'react-native'
import React, { FC, memo } from 'react'

const fixStyle = (style: any) => {
  if (style.backgroundColor) return style
  delete style.backgroundColor
  return style
}

// TODO: Upgrade memo check for native.base button props

export const Button: FC<NativeBase.Button> = memo((props) => {
  return Platform.OS === 'android' ? (
    <View
      style={{
        overflow: 'hidden',
        width: props.block ? '100%' : undefined,
      }}
      removeClippedSubviews
    >
      <NativeBaseButton {...props} {...{ style: fixStyle(props.style) }} />
    </View>
  ) : (
    <NativeBaseButton {...props} {...{ style: fixStyle(props.style) }} />
  )
})
