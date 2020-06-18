import React, { Component } from 'react'
import { observer } from 'mobx-react'
import { sharedColors } from '@utils/sharedColors'
import { PacmanIndicator } from 'react-native-indicators'

@observer
export class Spinner extends Component<{
  noPadding?: boolean
  maxHeight?: number
}> {
  render() {
    return (
      <PacmanIndicator
        color={sharedColors.primaryColor}
        animating
        style={{
          backgroundColor: sharedColors.backgroundColor,
          maxHeight: this.props.maxHeight || 45,
          paddingVertical: this.props.noPadding ? 0 : 6,
        }}
      />
    )
  }
}
