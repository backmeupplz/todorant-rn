import React, { Component } from 'react'
import { CardItem, View, Icon } from 'native-base'
import { Todo, isTodoToday, isTodoOld } from '@models/Todo'
import { sharedColors } from '@utils/sharedColors'
import { observer } from 'mobx-react'
import { CardType } from '@components/TodoCard/CardType'
import { TodoCardVM } from '@components/TodoCard/TodoCardVM'
import { navigate } from '@utils/navigation'
import { TouchableOpacity } from 'react-native-gesture-handler'
import CustomIcon from '@components/CustomIcon'

@observer
class IconButton extends Component<{
  onPress: () => void
  name: string
  color?: string
  rotation?: number
  fullColor?: boolean
}> {
  render() {
    return (
      <TouchableOpacity onPress={this.props.onPress}>
        <CustomIcon
          name={this.props.name}
          size={28}
          style={{
            color: this.props.color || sharedColors.defaultIconColor,
            opacity: this.props.fullColor ? 1.0 : 0.8,
            marginHorizontal: 6,
            transform: this.props.rotation
              ? [{ rotate: `${this.props.rotation}deg` }]
              : undefined,
          }}
        />
      </TouchableOpacity>
    )
  }
}

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
            alignItems: 'center',
          }}
        >
          <IconButton
            onPress={() => {
              this.props.vm.delete(this.props.todo)
            }}
            color={sharedColors.destructIconColor}
            name="delete_outline_28-iOS"
          />
          {this.props.type === CardType.planning &&
            !isTodoToday(this.props.todo) &&
            !isTodoOld(this.props.todo) && (
              <IconButton
                onPress={() => {
                  this.props.vm.moveToToday(this.props.todo)
                }}
                name="reply_outline_28"
                rotation={90}
              />
            )}
          {this.props.type !== CardType.current && (
            <IconButton
              onPress={() => {
                navigate('EditTodo', { editedTodo: this.props.todo })
              }}
              name="edit_outline_28"
            />
          )}
          {this.props.type === CardType.current &&
            this.props.vm.isSkippable(this.props.todo) && (
              <IconButton
                onPress={() => {
                  this.props.vm.skip(this.props.todo)
                }}
                name="arrow_right_outline_28--forward"
              />
            )}
          {(this.props.type === CardType.current ||
            this.props.type === CardType.planning) && (
            <IconButton
              onPress={() => {
                navigate('BreakdownTodo', {
                  breakdownTodo: this.props.todo,
                })
              }}
              name="list_outline_28"
            />
          )}
          {this.props.type === CardType.done ? (
            <IconButton
              onPress={() => {
                this.props.vm.uncomplete(this.props.todo)
              }}
              name="arrow_uturn_right_outline_28"
              color={sharedColors.successIconColor}
              fullColor
            />
          ) : (
            <IconButton
              onPress={() => {
                this.props.vm.complete(this.props.todo)
              }}
              name="done_outline_28--check"
              color={sharedColors.successIconColor}
              fullColor
            />
          )}
        </View>
      </CardItem>
    )
  }
}
