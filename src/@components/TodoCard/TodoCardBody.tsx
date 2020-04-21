import React, { Component } from 'react'
import { observer } from 'mobx-react'
import { CardItem, Body, View, Icon } from 'native-base'
import { TodoCardVM } from '@components/TodoCard/TodoCardVM'
import { CardType } from '@components/TodoCard/CardType'
import { Todo } from '@models/Todo'
import { sharedColors } from '@utils/sharedColors'
import { DebugTodoInfo } from '@components/TodoCard/DebugInfoTodo'
import { TodoCardTextBlock } from '@components/TodoCard/TodoCardTextBlock'
import { Clipboard } from 'react-native'
import { TouchableOpacity } from 'react-native-gesture-handler'

const showDebugInfo = false

@observer
export class TodoCardBody extends Component<{
  vm: TodoCardVM
  type: CardType
  todo: Todo
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
                flexDirection: 'row',
                justifyContent: 'space-between',
              }}
            >
              <TodoCardTextBlock todo={this.props.todo} isOld={isOld} />
              {this.props.type === CardType.breakdown && (
                <TouchableOpacity
                  onPress={async () => {
                    await Clipboard.setString(this.props.todo.text)
                  }}
                >
                  <Icon
                    type="MaterialIcons"
                    name="assignment"
                    style={{
                      fontSize: 20,
                      color: sharedColors.textColor,
                      paddingLeft: 5,
                      paddingTop: 3,
                    }}
                  />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </Body>
      </CardItem>
    )
  }
}
