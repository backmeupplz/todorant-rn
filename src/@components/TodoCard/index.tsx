import React, { Component } from 'react'
import { Todo } from '@models/Todo'
import { observer } from 'mobx-react'
import { CardType } from '@components/TodoCard/CardType'
import { TodoCardVM } from '@components/TodoCard/TodoCardVM'
import { TodoCardContent } from '@components/TodoCard/TodoCardContent'
import { TodoSwipeRow } from '@components/TodoCard/TodoSwipeRow'

@observer
export class TodoCard extends Component<{
  todo: Todo
  type: CardType
  drag?: () => void
}> {
  vm = new TodoCardVM()

  render() {
    return this.props.type === CardType.current ? (
      <TodoSwipeRow vm={this.vm} todo={this.props.todo}>
        <TodoCardContent {...this.props} vm={this.vm} />
      </TodoSwipeRow>
    ) : (
      <TodoCardContent {...this.props} vm={this.vm} />
    )
  }
}
