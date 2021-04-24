import React, { Component } from 'react'
import { CardItem, Icon, Text, View } from 'native-base'
import { translate } from '@utils/i18n'
import { sharedColors } from '@utils/sharedColors'
import { observer } from 'mobx-react'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { TodoCardVM } from '@components/TodoCard/TodoCardVM'
import { Todo } from '@models/Todo'
import { navigate } from '@utils/navigation'
import {
  DelegateSectionType,
  sharedDelegateStateStore,
} from '@stores/DelegateScreenStateStore'
import { IconButton } from '@components/IconButton'

@observer
export class DelegateCardActions extends Component<{
  vm: TodoCardVM
  todo: Todo
}> {
  render() {
    return (
      <View
        style={{
          justifyContent: 'space-between',
          flexDirection: 'row',
          alignItems: 'center',
          marginTop: 6,
          paddingHorizontal: 16,
        }}
      >
        <Text
          style={{
            color: sharedColors.borderColor,
          }}
        >
          {`${this.props.todo.monthAndYear || ''}${
            this.props.todo.date ? `-${this.props.todo.date}` : ''
          }`}
        </Text>
        <View
          style={{
            flexDirection: 'row',
            flex: 1,
            justifyContent: 'flex-end',
            alignItems: 'center',
          }}
        >
          {!this.props.todo.delegateAccepted && (
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'flex-end',
                alignItems: 'center',
              }}
            >
              <IconButton
                onPress={() => {
                  this.props.vm.delete(this.props.todo)
                }}
                color={sharedColors.destructIconColor}
                name="delete_outline_28-iOS"
              />
              <IconButton
                onPress={() => {
                  navigate('EditTodo', { editedTodo: this.props.todo })
                }}
                name="edit_outline_28"
              />
            </View>
          )}
        </View>
        {sharedDelegateStateStore.todoSection === DelegateSectionType.ToMe ? (
          <>
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
          </>
        ) : (
          <View></View>
        )}
      </View>
    )
  }
}
