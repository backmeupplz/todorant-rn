import React, { Component } from 'react'
import { observer } from 'mobx-react'
import { CardItem, Body, View, Text } from 'native-base'
import { TodoCardVM } from '@components/TodoCard/TodoCardVM'
import { CardType } from '@components/TodoCard/CardType'
import { Todo, getTitle } from '@models/Todo'
import { sharedColors } from '@utils/sharedColors'
import { DebugTodoInfo } from '@components/TodoCard/DebugInfoTodo'
import { TodoCardTextBlock } from '@components/TodoCard/TodoCardTextBlock'

const showDebugInfo = false

@observer
export class TodoCardBody extends Component<{
  vm: TodoCardVM
  type: CardType
  todo: Todo
  drag?: () => void
}> {
  render() {
    const isOld = this.props.vm.isOld(this.props.type, this.props.todo)
    return (
      <CardItem
        style={{
          backgroundColor: isOld ? sharedColors.oldTodoBackground : undefined,
        }}
      >
        <Body>
          {__DEV__ && showDebugInfo && <DebugTodoInfo todo={this.props.todo} />}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'flex-start',
              flex: 1,
            }}
          >
            <View
              style={{
                flex: 1,
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              {!!this.props.todo.delegatorName && (
                <Text>
                  <Text {...sharedColors.regularTextExtraStyle}>
                    {this.props.todo.delegatorName}
                  </Text>
                  {this.props.todo.delegateAccepted === false && (
                    <Text {...sharedColors.regularTextExtraStyle}>
                      {` ${getTitle(this.props.todo)}`}
                    </Text>
                  )}
                </Text>
              )}
              <TodoCardTextBlock
                todo={this.props.todo}
                isOld={isOld}
                drag={this.props.drag}
                type={this.props.type}
              />
            </View>
          </View>
        </Body>
      </CardItem>
    )
  }
}
