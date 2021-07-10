import React, { Component } from 'react'
import { observer } from 'mobx-react'
import { CardItem, Body, View, Text } from 'native-base'
import { TodoCardVM } from '@components/TodoCard/TodoCardVM'
import { CardType } from '@components/TodoCard/CardType'
import { Todo, getTitle } from '@models/Todo'
import { sharedColors } from '@utils/sharedColors'
import { DebugTodoInfo } from '@components/TodoCard/DebugInfoTodo'
import { TodoCardTextBlock } from '@components/TodoCard/TodoCardTextBlock'
import { translate } from '@utils/i18n'
import { MelonTodo, MelonUser } from '@models/MelonTodo'

const showDebugInfo = false

@observer
export class TodoCardBody extends Component<{
  vm: TodoCardVM
  type: CardType
  todo: MelonTodo
  delegator: MelonUser
  drag?: () => void
}> {
  render() {
    const isOld = this.props.vm.isOld(this.props.type, this.props.todo)
    return (
      <View
        style={{
          backgroundColor: isOld ? sharedColors.oldTodoBackground : undefined,
          marginHorizontal: 16,
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
              {!!this.props.delegator?.name &&
                this.props.type !== CardType.delegation && (
                  <Text>
                    <Text
                      onPress={() => {
                        this.props.vm.expanded = !this.props.vm.expanded
                      }}
                      {...sharedColors.regularTextExtraStyle}
                    >
                      {translate('delegate.from')}: {this.props.delegator?.name}
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
                vm={this.props.vm}
              />
            </View>
          </View>
        </Body>
      </View>
    )
  }
}
