import React, { Component } from 'react'
import { observer } from 'mobx-react'
import { TodoCardVM } from '@components/TodoCard/TodoCardVM'
import { Todo } from '@models/Todo'
import { CardType } from '@components/TodoCard/CardType'
import { View, Card, Text } from 'native-base'
import { sharedColors } from '@utils/sharedColors'
import {
  TouchableWithoutFeedback,
  TouchableOpacity,
} from 'react-native-gesture-handler'
import { TodoCardBody } from '@components/TodoCard/TodoCardBody'
import { TodoCardActions } from '@components/TodoCard/TodoCardActions'

@observer
export class TodoCardContent extends Component<{
  vm: TodoCardVM
  todo: Todo
  type: CardType
  drag?: () => void
}> {
  render() {
    return (
      <View
        style={{
          backgroundColor: sharedColors.cardBackgroundColor,
          marginHorizontal: 16,
          marginVertical: 8,
          borderRadius: 14,
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.05)',
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowColor: 'rgba(0, 0, 0, 0.04)',
          shadowRadius: 30,
        }}
      >
        <TodoCardBody
          vm={this.props.vm}
          todo={this.props.todo}
          type={this.props.type}
          drag={
            this.props.type === CardType.planning ? this.props.drag : undefined
          }
        />

        {this.props.type !== CardType.breakdown && (
          <TodoCardActions
            todo={this.props.todo}
            type={this.props.type}
            vm={this.props.vm}
          />
        )}
      </View>
    )
  }
}
