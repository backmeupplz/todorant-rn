import { observer } from 'mobx-react'
import React, { Component } from 'react'
import { Todo } from '@models/Todo'
import { Text } from 'native-base'
import { sharedColors } from '@utils/sharedColors'
import { TodoText } from '@components/TodoCard/TodoText'

@observer
export class TodoCardTextBlock extends Component<{
  todo: Todo
  isOld: boolean
}> {
  render() {
    return (
      <Text style={{ flex: 1 }}>
        <Text {...sharedColors.textExtraStyle}>
          {this.props.isOld && <Text style={{ color: 'tomato' }}>! </Text>}
          {__DEV__ && `(${this.props.todo.order}) `}
          {this.props.todo.frog ? '🐸 ' : ''}
          {this.props.todo.time ? `${this.props.todo.time} ` : ''}
        </Text>
        <TodoText
          text={this.props.todo.text}
          isOld={this.props.isOld}
        ></TodoText>
      </Text>
    )
  }
}
