import { Body, CardItem, Text, View } from 'native-base'
import { CardType } from '@components/TodoCard/CardType'
import { DebugTodoInfo } from '@components/TodoCard/DebugInfoTodo'
import { MelonTodo, MelonUser } from '@models/MelonTodo'
import { TodoCardTextBlock } from '@components/TodoCard/TodoCardTextBlock'
import { TodoCardVM } from '@components/TodoCard/TodoCardVM'
import { getTitle } from '@models/Todo'
import { observer } from 'mobx-react'
import { sharedColors } from '@utils/sharedColors'
import { translate } from '@utils/i18n'
import React, { Component } from 'react'

const showDebugInfo = false

@observer
export class TodoCardBody extends Component<{
  vm: TodoCardVM
  type: CardType
  todo: MelonTodo
  delegator?: MelonUser
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
