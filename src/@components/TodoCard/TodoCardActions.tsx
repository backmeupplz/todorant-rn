import React, { Component } from 'react'
import { CardItem, View, Text, Button, Icon } from 'native-base'
import { Todo, isTodoToday } from '@models/Todo'
import { sharedColors } from '@utils/sharedColors'
import { observer } from 'mobx-react'
import { translate } from '@utils/i18n'
import { CardType } from '@components/TodoCard/CardType'
import { extraButtonProps } from '@utils/extraButtonProps'
import { TodoCardVM } from '@components/TodoCard/TodoCardVM'
import { navigate } from '@utils/navigation'

@observer
export class TodoCardActions extends Component<{
  todo: Todo
  type: CardType
  vm: TodoCardVM
}> {
  render() {
    return (
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
                  this.props.vm.moveToToday(this.props.todo)
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
              this.props.vm.delete(this.props.todo)
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
            !this.props.vm.isLast(this.props.todo) && (
              <Button
                icon
                {...extraButtonProps(sharedColors)}
                onPress={() => {
                  this.props.vm.skip(this.props.todo)
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
                this.props.vm.uncomplete(this.props.todo)
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
                this.props.vm.complete(this.props.todo)
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
    )
  }
}