import React, { Component } from 'react'
import { observer } from 'mobx-react'
import { TouchableOpacity } from 'react-native-gesture-handler'
import CustomIcon from '@components/CustomIcon'
import { sharedColors } from '@utils/sharedColors'

@observer
export class IconButton extends Component<{
  onPress: () => void
  name: string
  color?: string
  fullColor?: boolean
  size?: number
  disabled?: boolean
}> {
  render() {
    return (
      <TouchableOpacity
        onPress={this.props.onPress}
        disabled={this.props.disabled}
      >
        <CustomIcon
          name={this.props.name}
          size={this.props.size || 28}
          style={{
            color: !this.props.disabled
              ? this.props.color || sharedColors.defaultIconColor
              : 'gray',
            opacity: this.props.fullColor ? 1.0 : 0.8,
            marginHorizontal: 6,
          }}
        />
      </TouchableOpacity>
    )
  }
}
