import { View } from 'native-base'
import { observer } from 'mobx-react'
import React, { Component } from 'react'

@observer
export class ProgressView extends Component<{
  progress: number
  tintColor: string
  trackColor: string
}> {
  render() {
    return (
      <View
        style={{
          backgroundColor: this.props.trackColor,
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
            width: `${this.props.progress * 100}%`,
            backgroundColor: this.props.tintColor,
            borderRadius: 10,
          }}
        ></View>
      </View>
    )
  }
}
