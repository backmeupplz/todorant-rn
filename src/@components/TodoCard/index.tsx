import React, { Component } from 'react'
import { Todo, isTodoToday, isTodoOld } from '@models/Todo'
import { Card, CardItem, Body, Text, Button, Icon, View } from 'native-base'
import { observer } from 'mobx-react'
import { navigate } from '@utils/navigation'
import { sharedAppStateStore, PlanningMode } from '@stores/AppStateStore'
import { computed } from 'mobx'
import { translate } from '@utils/i18n'
import { sharedColors } from '@utils/sharedColors'
import { extraButtonProps } from '@utils/extraButtonProps'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { CardType } from '@components/TodoCard/CardType'
import { TodoCardVM } from '@components/TodoCard/TodoCardVM'
import { DebugTodoInfo } from '@components/TodoCard/DebugInfoTodo'
import { TodoCardTextBlock } from '@components/TodoCard/TodoCardTextBlock'

const showDebugInfo = false

@observer
export class TodoCard extends Component<{
  todo: Todo
  type: CardType
  drag?: () => void
}> {
  vm = new TodoCardVM()

  @computed get isOld() {
    return this.props.type !== CardType.done && isTodoOld(this.props.todo)
  }

  render() {
    return (
      <Card
        noShadow
        style={{
          backgroundColor: sharedColors.backgroundColor,
          borderColor: sharedColors.borderColor,
        }}
      >
        <CardItem
          style={{
            backgroundColor: this.isOld
              ? sharedColors.oldTodoBackground
              : undefined,
          }}
        >
          <Body>
            {__DEV__ && showDebugInfo && (
              <DebugTodoInfo todo={this.props.todo} />
            )}
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'flex-start',
                flex: 1,
              }}
            >
              {this.props.type !== CardType.breakdown &&
                this.props.type !== CardType.current &&
                sharedAppStateStore.planningMode === PlanningMode.rearrange && (
                  <TouchableOpacity onPressIn={this.props.drag}>
                    <Icon
                      type="MaterialIcons"
                      name="menu"
                      style={{
                        marginRight: 5,
                        ...sharedColors.iconExtraStyle.style,
                      }}
                    />
                  </TouchableOpacity>
                )}
              <View
                style={{
                  flex: 1,
                  paddingTop:
                    this.props.type !== CardType.current &&
                    sharedAppStateStore.planningMode === PlanningMode.rearrange
                      ? 5
                      : 0,
                }}
              >
                <TodoCardTextBlock todo={this.props.todo} isOld={this.isOld} />
              </View>
            </View>
          </Body>
        </CardItem>
        {this.props.type !== CardType.breakdown &&
          (sharedAppStateStore.planningMode === PlanningMode.default ||
            this.props.type === CardType.current) && (
            <CardItem
              footer
              style={{
                justifyContent: 'space-between',
                backgroundColor: 'transparent',
              }}
            >
              {this.props.todo.skipped && (
                <View>
                  <Text {...sharedColors.textExtraStyle}>
                    ({translate('skipped')})
                  </Text>
                </View>
              )}
              <View
                style={{
                  flexDirection: 'row',
                  flex: 1,
                  justifyContent: 'flex-end',
                }}
              >
                {this.props.type === CardType.planning &&
                  !isTodoToday(this.props.todo) && (
                    <Button
                      icon
                      {...extraButtonProps(sharedColors)}
                      onPress={() => {
                        this.vm.moveToToday(this.props.todo)
                      }}
                    >
                      <Icon
                        type="MaterialIcons"
                        name="arrow-upward"
                        {...sharedColors.iconExtraStyle}
                      />
                    </Button>
                  )}
                <Button
                  icon
                  {...extraButtonProps(sharedColors)}
                  onPress={() => {
                    this.vm.delete(this.props.todo)
                  }}
                >
                  <Icon
                    type="MaterialIcons"
                    name="delete"
                    style={{ color: sharedColors.primaryColor }}
                    {...sharedColors.iconExtraStyle}
                  />
                </Button>
                {this.props.type !== CardType.current && (
                  <Button
                    icon
                    {...extraButtonProps(sharedColors)}
                    onPress={() => {
                      navigate('EditTodo', { editedTodo: this.props.todo })
                    }}
                  >
                    <Icon
                      type="MaterialIcons"
                      name="edit"
                      {...sharedColors.iconExtraStyle}
                    />
                  </Button>
                )}
                {this.props.type === CardType.current &&
                  !this.props.todo.frog &&
                  !this.vm.isLast(this.props.todo) && (
                    <Button
                      icon
                      {...extraButtonProps(sharedColors)}
                      onPress={() => {
                        this.vm.skip(this.props.todo)
                      }}
                    >
                      <Icon
                        type="MaterialIcons"
                        name="arrow-forward"
                        {...sharedColors.iconExtraStyle}
                      />
                    </Button>
                  )}
                {this.props.type === CardType.current && (
                  <Button
                    icon
                    {...extraButtonProps(sharedColors)}
                    onPress={() => {
                      navigate('BreakdownTodo', {
                        breakdownTodo: this.props.todo,
                      })
                    }}
                  >
                    <Icon
                      type="MaterialIcons"
                      name="list"
                      {...sharedColors.iconExtraStyle}
                    />
                  </Button>
                )}
                {this.props.type === CardType.done ? (
                  <Button
                    icon
                    {...extraButtonProps(sharedColors)}
                    onPress={() => {
                      this.vm.uncomplete(this.props.todo)
                    }}
                  >
                    <Icon
                      type="MaterialIcons"
                      name="repeat"
                      {...sharedColors.iconExtraStyle}
                    />
                  </Button>
                ) : (
                  <Button
                    icon
                    {...extraButtonProps(sharedColors)}
                    onPress={() => {
                      this.vm.complete(this.props.todo)
                    }}
                  >
                    <Icon
                      type="MaterialIcons"
                      name="done"
                      {...sharedColors.iconExtraStyle}
                    />
                  </Button>
                )}
              </View>
            </CardItem>
          )}
      </Card>
    )
  }
}
