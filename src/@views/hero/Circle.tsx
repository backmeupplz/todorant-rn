import { Observer } from 'mobx-react'
import { View } from 'native-base'
import React, { FC, memo } from 'react'

export const Circle: FC<{
  backgroundColor: string
}> = memo(({ backgroundColor }) => {
  return (
    <Observer>
      {() => {
        return (
          <View
            style={{
              width: 20,
              height: 20,
              borderColor: backgroundColor,
              borderWidth: 6,
              borderRadius: 10,
            }}
          ></View>
        )
      }}
    </Observer>
  )
})
