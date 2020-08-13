import React, { Component } from 'react'
import { observer } from 'mobx-react'
import { TodoCardVM } from '@components/TodoCard/TodoCardVM'
import { Todo } from '@models/Todo'
import { CardType } from '@components/TodoCard/CardType'
import { View } from 'native-base'
import { sharedColors } from '@utils/sharedColors'
import { TodoCardBody } from '@components/TodoCard/TodoCardBody'
import { TodoCardActions } from '@components/TodoCard/TodoCardActions'
import { DelegateCardActions } from '@components/TodoCard/DelegateCardActions'
import { Divider } from '@components/Divider'
import { FailCircle } from './FailCircle'

@observer
export class TodoCardContent extends Component<{
  vm: TodoCardVM
  todo: Todo
  type: CardType
  drag?: () => void
  active?: boolean
}> {
  render() {
    return (
      <View>
        <View
          style={{
            paddingVertical: 10,
          }}
        >
          {!!this.props.todo.frogFails && (
            <View
              style={{
                flex: 1,
                flexDirection: 'row',
                paddingLeft: 16,
                marginBottom: 6,
              }}
            >
              {Array(this.props.todo.frogFails)
                .fill(0)
                .map(() => (
                  <FailCircle />
                ))}
            </View>
          )}
          <TodoCardBody
            vm={this.props.vm}
            todo={this.props.todo}
            type={this.props.type}
            drag={
              this.props.type === CardType.planning
                ? this.props.drag
                : undefined
            }
          />

          {this.props.type !== CardType.breakdown &&
            this.props.type !== CardType.delegation &&
            (this.props.vm.expanded ||
              this.props.type === CardType.current) && (
              <TodoCardActions
                todo={this.props.todo}
                type={this.props.type}
                vm={this.props.vm}
              />
            )}
          {this.props.type === CardType.delegation && (
            <DelegateCardActions vm={this.props.vm} todo={this.props.todo} />
          )}
        </View>
        {!this.props.active && this.props.type !== CardType.current && (
          <Divider color={sharedColors.dividerColor} marginVertical={0} />
        )}
      </View>
    )
  }
}
