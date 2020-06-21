import React, { Component } from 'react'
import { observer } from 'mobx-react'
import { TodoVM } from '@views/add/TodoVM'
import { Icon } from 'native-base'
import { sharedColors } from '@utils/sharedColors'
import { TouchableOpacity } from 'react-native'

@observer
export class CollapseButton extends Component<{ vm: TodoVM }> {
  render() {
    return (
      <TouchableOpacity
        onPress={() => {
          this.props.vm.collapsed = !this.props.vm.collapsed
        }}
      >
        <Icon
          type="MaterialIcons"
          name={
            this.props.vm.collapsed
              ? 'keyboard-arrow-down'
              : 'keyboard-arrow-up'
          }
          style={{
            color:
              !this.props.vm.collapsed || this.props.vm.isValid
                ? sharedColors.textColor
                : 'tomato',
            fontSize: 20,
            marginTop: this.props.vm.collapsed ? undefined : 5,
          }}
        />
      </TouchableOpacity>
    )
  }
}
