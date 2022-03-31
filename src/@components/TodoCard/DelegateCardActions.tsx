import {
  DelegateSectionType,
  sharedDelegateStateStore,
} from '@stores/DelegateScreenStateStore'
import { IconButton } from '@components/IconButton'
import { MelonTodo } from '@models/MelonTodo'
import { Text, View } from 'native-base'
import { TodoCardVM } from '@components/TodoCard/TodoCardVM'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { checkSubscriptionAndNavigate } from '@utils/checkSubscriptionAndNavigate'
import { observer } from 'mobx-react'
import { sharedColors } from '@utils/sharedColors'
import { translate } from '@utils/i18n'
import React, { Component } from 'react'

@observer
export class DelegateCardActions extends Component<{
  vm: TodoCardVM
  todo: MelonTodo
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
                  checkSubscriptionAndNavigate('EditTodo', {
                    editedTodo: this.props.todo,
                  })
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
