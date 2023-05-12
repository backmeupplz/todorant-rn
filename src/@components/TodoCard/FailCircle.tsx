import { View } from 'native-base'
import { observer } from 'mobx-react'
import { sharedColors } from '@utils/sharedColors'
import React from 'react'

export const FailCircle = observer(() => {
  return (
    <View
      style={{
        width: 8,
        height: 6,
        borderRadius: 20,
        backgroundColor: sharedColors.primaryColor,
        marginRight: 4,
      }}
    />
  )
})
