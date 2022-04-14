import { Observer } from 'mobx-react'
import { PacmanIndicator } from 'react-native-indicators'
import { sharedColors } from '@utils/sharedColors'
import React, { FC, memo } from 'react'

export const Spinner: FC<{
  noPadding?: boolean
  maxHeight?: number
  noBackgroundColor?: boolean
}> = memo((props) => {
  return (
    <Observer>
      {() => {
        return (
          <PacmanIndicator
            color={sharedColors.primaryColor}
            animating
            style={{
              backgroundColor: props.noBackgroundColor
                ? undefined
                : sharedColors.backgroundColor,
              maxHeight: props.maxHeight || 45,
              paddingVertical: props.noPadding ? 0 : 6,
            }}
          />
        )
      }}
    </Observer>
  )
})
