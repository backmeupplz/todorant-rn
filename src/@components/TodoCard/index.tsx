import React, { Component } from 'react'
import { Todo } from '@models/Todo'
import { Card } from 'native-base'
import { observer } from 'mobx-react'
import { sharedColors } from '@utils/sharedColors'
import { CardType } from '@components/TodoCard/CardType'
import { TodoCardVM } from '@components/TodoCard/TodoCardVM'
import { TodoCardActions } from './TodoCardActions'
import { TodoCardBody } from './TodoCardBody'
import { TouchableWithoutFeedback } from 'react-native-gesture-handler'

@observer
export class TodoCard extends Component<{
  todo: Todo
  type: CardType
  drag?: () => void
}> {
  vm = new TodoCardVM()

  render() {
    return (
      <Card
        noShadow
        style={{
          backgroundColor: sharedColors.backgroundColor,
          borderColor: sharedColors.borderColor,
        }}
      >
        <TouchableWithoutFeedback onLongPress={this.props.drag}>
          <TodoCardBody
            vm={this.vm}
            todo={this.props.todo}
            type={this.props.type}
          />
        </TouchableWithoutFeedback>
        {this.props.type !== CardType.breakdown && (
          <TodoCardActions
            todo={this.props.todo}
            type={this.props.type}
            vm={this.vm}
          />
        )}
      </Card>
    )
  }
}
