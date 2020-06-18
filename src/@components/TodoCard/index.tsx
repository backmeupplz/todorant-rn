import React, { Component } from 'react'
import { Todo } from '@models/Todo'
import { observer } from 'mobx-react'
import { CardType } from '@components/TodoCard/CardType'
import { TodoCardVM } from '@components/TodoCard/TodoCardVM'
import { TodoCardContent } from '@components/TodoCard/TodoCardContent'

@observer
export class TodoCard extends Component<{
  todo: Todo
  type: CardType
  drag?: () => void
}> {
  vm = new TodoCardVM()

  render() {
    return <TodoCardContent {...this.props} vm={this.vm} />
  }
}
