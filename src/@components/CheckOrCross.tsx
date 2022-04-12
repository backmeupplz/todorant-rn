import { Component } from 'react'
import { Icon } from 'native-base'
import { observer } from 'mobx-react'
import { sharedColors } from '@utils/sharedColors'
import React from 'react'

@observer
export class CheckOrCross extends Component<{ ok: boolean }> {
  render() {
    return (
      <Icon
        type="MaterialIcons"
        name={this.props.ok ? 'check' : 'close'}
        style={{
          color: this.props.ok
            ? sharedColors.successIconColor
            : sharedColors.destructIconColor,
        }}
      />
    )
  }
}
