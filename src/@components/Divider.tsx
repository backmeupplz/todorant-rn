import { View } from 'native-base'
import { observer } from 'mobx-react'
import { sharedColors } from '@utils/sharedColors'
import React, { Component } from 'react'

@observer
export class Divider extends Component<{
  color?: string
  marginVertical?: number
  marginHorizontal?: number
}> {
  render() {
    return (
      <View
        style={{
          backgroundColor: this.props.color || sharedColors.borderColor,
          height: 1,
          marginHorizontal:
            this.props.marginHorizontal === undefined
              ? 16
              : this.props.marginHorizontal,
          marginVertical:
            this.props.marginVertical === undefined
              ? 6
              : this.props.marginVertical,
        }}
      />
    )
  }
}
