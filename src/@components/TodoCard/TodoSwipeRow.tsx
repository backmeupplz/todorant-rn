import React, { Component } from 'react'
import { observer } from 'mobx-react'
import { TodoCardVM } from '@components/TodoCard/TodoCardVM'
import { makeObservable, observable } from 'mobx'
import { Todo } from '@models/Todo'
import { SwipeRow } from 'react-native-swipe-list-view'
import { sharedColors } from '@utils/sharedColors'
import { TodoCardBackground } from '@components/TodoCard/TodoCardBackground'

const threshold = 125

@observer
export class TodoSwipeRow extends Component<{
  vm: TodoCardVM
  todo: Todo
}> {
  @observable direction = 'left'
  acting = false

  componentWillMount() {
    makeObservable(this)
  }

  render() {
    return (
      <SwipeRow
        onSwipeValueChange={(data) => {
          this.direction = data.value > 0 ? 'left' : 'right'
          if (data.value <= -threshold) {
            if (this.acting) {
              return
            }
            this.acting = true
            this.props.vm.delete(this.props.todo)
          } else if (data.value >= threshold) {
            if (this.acting) {
              return
            }
            this.acting = true
            this.props.vm.complete(this.props.todo)
          } else if (data.value > -threshold || data.value < threshold) {
            this.acting = false
          }
        }}
        style={{
          backgroundColor:
            this.direction === 'left' ? sharedColors.done : sharedColors.delete,
        }}
      >
        <TodoCardBackground direction={this.direction} todo={this.props.todo} />
        {this.props.children}
      </SwipeRow>
    )
  }
}
