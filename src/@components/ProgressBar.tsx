import { observer } from 'mobx-react'
import React, { Component } from 'react'
import { Platform, ProgressViewIOS, ProgressBarAndroid } from 'react-native'
import { sharedColors } from '@utils/sharedColors'

@observer
export class ProgressBar extends Component<{
  progress: number
  color?: string
  trackColor?: string
}> {
  render() {
    return Platform.OS === 'ios' ? (
      <ProgressViewIOS
        progress={this.props.progress}
        style={{ flex: 1, marginEnd: 12 }}
        progressTintColor={this.props.color || sharedColors.primaryColor}
        trackTintColor={this.props.trackColor}
      />
    ) : (
      <ProgressBarAndroid
        styleAttr="Horizontal"
        indeterminate={false}
        progress={this.props.progress}
        style={{ flex: 1, marginEnd: 12 }}
        color={this.props.color || sharedColors.primaryColor}
      />
    )
  }
}
