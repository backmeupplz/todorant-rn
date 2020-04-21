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
      <View style={{ backgroundColor: sharedColors.backgroundColor }}>
        <Card
          noShadow
          style={{
            backgroundColor: sharedColors.backgroundColor,
            borderColor: sharedColors.borderColor,
          }}
        >
          {this.props.type === CardType.planning ? (
            <TouchableOpacity onLongPress={this.props.drag}>
              <TodoCardBody
                vm={this.props.vm}
                todo={this.props.todo}
                type={this.props.type}
              />
            </TouchableOpacity>
          ) : (
            <TodoCardBody
              vm={this.props.vm}
              todo={this.props.todo}
              type={this.props.type}
            />
          )}
          {this.props.type !== CardType.breakdown && (
            <TodoCardActions
              todo={this.props.todo}
              type={this.props.type}
              vm={this.props.vm}
            />
          )}
        </Card>
      </View>
    )
  }
}
