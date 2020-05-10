import React, { Component } from 'react'
import { CardItem, View, Icon } from 'native-base'
import { Todo, isTodoToday, isTodoOld } from '@models/Todo'
import { sharedColors } from '@utils/sharedColors'
import { observer } from 'mobx-react'
import { CardType } from '@components/TodoCard/CardType'
import { extraButtonProps } from '@utils/extraButtonProps'
import { TodoCardVM } from '@components/TodoCard/TodoCardVM'
import { navigate } from '@utils/navigation'
import { Button } from '@components/Button'

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
        {!!this.props.todo.encrypted && (
          <Icon
            type="MaterialIcons"
            name="vpn-key"
            style={{ color: 'grey', fontSize: 15, marginRight: -15 }}
          />
        )}
        {this.props.todo.skipped && (
          <Icon
            type="MaterialIcons"
            name="arrow-forward"
            style={{ color: 'grey', fontSize: 15 }}
          />
        )}
        <View
          style={{
            flexDirection: 'row',
            flex: 1,
            justifyContent: 'flex-end',
          }}
        >
          {this.props.type === CardType.planning &&
            !isTodoToday(this.props.todo) &&
            !isTodoOld(this.props.todo) && (
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
            this.props.vm.isSkippable(this.props.todo) && (
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
          {(this.props.type === CardType.current ||
            this.props.type === CardType.planning) && (
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
