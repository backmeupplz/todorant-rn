import React, { Component } from 'react'
import { CardItem, Text } from 'native-base'
import { translate } from '@utils/i18n'
import { sharedColors } from '@utils/sharedColors'
import { observer } from 'mobx-react'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { TodoCardVM } from '@components/TodoCard/TodoCardVM'
import { Todo } from '@models/Todo'

@observer
export class DelegateCardActions extends Component<{
  vm: TodoCardVM
  todo: Todo
}> {
  render() {
    return (
      <CardItem
        footer
        style={{
          justifyContent: 'space-between',
          backgroundColor: 'transparent',
        }}
      >
        <TouchableOpacity
          onPress={() => {
            this.props.vm.accept(this.props.todo)
          }}
        >
          <Text
            style={{
              ...sharedColors.regularTextExtraStyle.style,
              color: sharedColors.successIconColor,
            }}
          >
            {translate('accept')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            this.props.vm.delete(this.props.todo)
          }}
        >
          <Text
            style={{
              ...sharedColors.regularTextExtraStyle.style,
              color: sharedColors.destructIconColor,
            }}
          >
            {translate('delete')}
          </Text>
        </TouchableOpacity>
      </CardItem>
    )
  }
}
