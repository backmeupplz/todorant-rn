import React, { Component } from 'react'
import { observer } from 'mobx-react'
import { View } from 'native-base'
import { sharedColors } from '@utils/sharedColors'

@observer
export class Divider extends Component {
  render() {
    return (
      <View
        style={{
          backgroundColor: sharedColors.borderColor,
          height: 1,
          marginHorizontal: 16,
          marginVertical: 6,
        }}
      />
    )
  }
}
