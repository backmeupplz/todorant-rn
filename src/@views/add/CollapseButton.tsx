import React, { Component } from 'react'
import { observer } from 'mobx-react'
import { TodoVM } from '@views/add/TodoVM'
import { Icon } from 'native-base'
import { extraButtonProps } from '@utils/extraButtonProps'
import { sharedColors } from '@utils/sharedColors'
import { Button } from '@components/Button'

@observer
export class CollapseButton extends Component<{ vm: TodoVM }> {
  render() {
    return (
      <Button
        icon
        {...extraButtonProps(sharedColors)}
        small
        onPress={() => {
          this.props.vm.collapsed = !this.props.vm.collapsed
        }}
        style={{
          ...extraButtonProps(sharedColors).style,
          marginHorizontal: -10,
          paddingHorizontal: -10,
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
          }}
        />
      </Button>
    )
  }
}
