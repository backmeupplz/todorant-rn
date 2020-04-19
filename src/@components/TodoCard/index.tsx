import React, { Component } from 'react'
import { Todo } from '@models/Todo'
import { Card, View, Icon } from 'native-base'
import { observer } from 'mobx-react'
import { sharedColors } from '@utils/sharedColors'
import { CardType } from '@components/TodoCard/CardType'
import { TodoCardVM } from '@components/TodoCard/TodoCardVM'
import { TodoCardActions } from './TodoCardActions'
import { TodoCardBody } from './TodoCardBody'
import { TouchableWithoutFeedback } from 'react-native-gesture-handler'
import { SwipeRow } from 'react-native-swipe-list-view'
import { observable } from 'mobx'

@observer
class TodoCardBackground extends Component<{
  direction: string
  todo: Todo
}> {
  render() {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'flex-start',
          alignItems:
            this.props.direction === 'left' ? 'flex-start' : 'flex-end',
          paddingHorizontal: 20,
          marginTop: 20,
        }}
      >
        <Icon
          type="MaterialIcons"
          name={this.props.direction === 'left' ? 'done' : 'delete'}
          {...sharedColors.iconExtraStyle}
          style={{ color: 'white' }}
        />
      </View>
    )
  }
}

const threshold = 125

@observer
class TodoSwipeRow extends Component<{
  vm: TodoCardVM
  todo: Todo
}> {
  @observable direction = 'left'
  acting = false

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

@observer
class TodoCardContent extends Component<{
  vm: TodoCardVM
  todo: Todo
  type: CardType
  drag?: () => void
}> {
  render() {
    return (
      <View style={{ flex: 1, backgroundColor: sharedColors.backgroundColor }}>
        <Card
          noShadow
          style={{
            backgroundColor: sharedColors.backgroundColor,
            borderColor: sharedColors.borderColor,
          }}
        >
          <TouchableWithoutFeedback onLongPress={this.props.drag}>
            <TodoCardBody
              vm={this.props.vm}
              todo={this.props.todo}
              type={this.props.type}
            />
          </TouchableWithoutFeedback>
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
