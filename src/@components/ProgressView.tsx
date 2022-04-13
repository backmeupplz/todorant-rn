import { Observer } from 'mobx-react'
import { View } from 'native-base'
import React, { FC, memo } from 'react'

export const ProgressView: FC<{
  progress: number
  tintColor: string
  trackColor: string
}> = memo((props) => {
  return (
    <Observer>
      {() => {
        return (
          <View
            style={{
              backgroundColor: props.trackColor,
              flex: 1,
              height: 4,
              width: '100%',
              borderRadius: 10,
            }}
          >
            <View
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                height: '100%',
                width: `${props.progress * 100}%`,
                backgroundColor: props.tintColor,
                borderRadius: 10,
              }}
            ></View>
          </View>
        )
      }}
    </Observer>
  )
})
