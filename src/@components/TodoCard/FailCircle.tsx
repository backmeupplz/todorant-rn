import { Component } from 'react'
import { View } from 'native-base'
import { observer } from 'mobx-react'
import { sharedColors } from '@utils/sharedColors'
import React from 'react'

@observer
export class FailCircle extends Component {
  render() {
    return (
      <View
        style={{
          width: 8,
          height: 6,
          borderRadius: 20,
          backgroundColor: sharedColors.primaryColor,
          marginRight: 4,
        }}
      ></View>
    )
  }
}
