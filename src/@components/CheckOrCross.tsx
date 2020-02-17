import React, { Component } from 'react'
import { Icon } from 'native-base'

export class CheckOrCross extends Component<{ ok: boolean }> {
  render() {
    return (
      <Icon
        type="MaterialIcons"
        name={this.props.ok ? 'check' : 'close'}
        style={{
          color: this.props.ok ? 'green' : 'tomato',
        }}
      />
    )
  }
}
