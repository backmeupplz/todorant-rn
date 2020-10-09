import React from 'react'
import { BackButton } from '@components/BackButton'
import { View } from 'native-base'

export function headerBackButtonProps(useBackStore = false) {
  return {
    headerLeft: () => (
      <View style={{ flexDirection: 'row' }}>
        <BackButton useBackStore={useBackStore} />
      </View>
    ),
  }
}
