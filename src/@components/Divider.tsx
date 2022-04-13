import { Observer } from 'mobx-react'
import { View } from 'native-base'
import { sharedColors } from '@utils/sharedColors'
import React, { FC, memo } from 'react'

export const Divider: FC<{
  color?: string
  marginVertical?: number
  marginHorizontal?: number
}> = memo((props) => {
  return (
    <Observer>
      {() => {
        return (
          <View
            style={{
              backgroundColor: props.color || sharedColors.borderColor,
              height: 1,
              marginHorizontal:
                props.marginHorizontal === undefined
                  ? 16
                  : props.marginHorizontal,
              marginVertical:
                props.marginVertical === undefined ? 6 : props.marginVertical,
            }}
          />
        )
      }}
    </Observer>
  )
})
