import { Component } from 'react'
import { Icon } from 'native-base'
import { TodoVM } from '@views/add/TodoVM'
import { TouchableOpacity } from 'react-native'
import { observer } from 'mobx-react'
import { sharedColors } from '@utils/sharedColors'
import React from 'react'

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
            fontSize: 25,
            padding: 5,
          }}
        />
      </TouchableOpacity>
    )
  }
}
