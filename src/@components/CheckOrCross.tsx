import React, { Component } from 'react'
import { Icon } from 'native-base'
import { sharedColors } from '@utils/sharedColors'
import { observer } from 'mobx-react'

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
