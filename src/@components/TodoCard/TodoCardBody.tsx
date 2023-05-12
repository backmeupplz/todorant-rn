import { Body, Text, View } from 'native-base'
import { CardType } from '@components/TodoCard/CardType'
import { DebugTodoInfo } from '@components/TodoCard/DebugInfoTodo'
import { MelonTodo, MelonUser } from '@models/MelonTodo'
import { TodoCardTextBlock } from '@components/TodoCard/TodoCardTextBlock'
import { TodoCardVM } from '@components/TodoCard/TodoCardVM'
import { getTitle } from '@models/Todo'
import { observer } from 'mobx-react'
import { sharedColors } from '@utils/sharedColors'
import { translate } from '@utils/i18n'
import React from 'react'

const showDebugInfo = false

export const TodoCardBody = observer(
  ({
    vm,
    type,
    todo,
    delegator,
    drag,
  }: {
    vm: TodoCardVM
    type: CardType
    todo: MelonTodo
    delegator?: MelonUser
    drag?: () => void
  }) => {
    const isOld = vm.isOld(type, todo)

    return (
      <View
        style={{
          backgroundColor: isOld ? sharedColors.oldTodoBackground : undefined,
          marginHorizontal: 16,
        }}
      >
        <Body>
          {__DEV__ && showDebugInfo && <DebugTodoInfo todo={todo} />}
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
              {!!delegator?.name && type !== CardType.delegation && (
                <Text>
                  <Text
                    onPress={() => {
                      vm.expanded = !vm.expanded
                    }}
                    {...sharedColors.regularTextExtraStyle}
                  >
                    {translate('delegate.from')}: {delegator?.name}
                  </Text>
                  {todo.delegateAccepted === false && (
                    <Text {...sharedColors.regularTextExtraStyle}>
                      {`${getTitle(todo)}`}
                    </Text>
                  )}
                </Text>
              )}
              <TodoCardTextBlock
                todo={todo}
                isOld={isOld}
                drag={drag}
                type={type}
                vm={vm}
              />
            </View>
          </View>
        </Body>
      </View>
    )
  }
)
