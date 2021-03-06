import React, { Component } from 'react'
import { View, Icon } from 'native-base'
import { Todo, isTodoToday } from '@models/Todo'
import { sharedColors } from '@utils/sharedColors'
import { observer } from 'mobx-react'
import { CardType } from '@components/TodoCard/CardType'
import { TodoCardVM } from '@components/TodoCard/TodoCardVM'
import { navigate } from '@utils/navigation'
import { IconButton } from '@components/IconButton'
import { sharedAppStateStore } from '@stores/AppStateStore'
import { isTodoOld } from '@utils/isTodoOld'
import { sharedOnboardingStore, TutorialStep } from '@stores/OnboardingStore'

export let TodoActionsNodeId: number
export let BrakdownNodeId: number

@observer
export class TodoCardActions extends Component<{
  todo: Todo
  type: CardType
  vm: TodoCardVM
}> {
  render() {
    return (
      <View
        style={{
          justifyContent: 'space-between',
          flexDirection: 'row',
          alignItems: 'center',
          marginTop: 6,
          paddingHorizontal: 16,
        }}
      >
        <View style={{ flexDirection: 'row' }}>
          {!!this.props.todo.encrypted && (
            <Icon
              type="MaterialIcons"
              name="vpn-key"
              style={{ color: 'grey', fontSize: 15 }}
            />
          )}
          {this.props.todo.skipped && (
            <Icon
              type="MaterialIcons"
              name="arrow-forward"
              style={{ color: 'grey', fontSize: 15 }}
            />
          )}
        </View>
        <View
          style={{
            flexDirection: 'row',
            flex: 1,
            justifyContent: 'flex-end',
            alignItems: 'center',
          }}
        >
          <View
            onLayout={({ nativeEvent: { target } }: any) => {
              TodoActionsNodeId = target
            }}
            style={{
              flexDirection: 'row',
              justifyContent: 'flex-end',
              alignItems: 'center',
            }}
          >
            <IconButton
              disabled={!sharedOnboardingStore.tutorialWasShown}
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
                  name="reply_outline_28-1"
                />
              )}
            <IconButton
              disabled={!sharedOnboardingStore.tutorialWasShown}
              onPress={() => {
                navigate('EditTodo', { editedTodo: this.props.todo })
              }}
              name="edit_outline_28"
            />
            {this.props.type === CardType.current &&
              this.props.vm.isSkippable(this.props.todo) && (
                <IconButton
                  disabled={!sharedOnboardingStore.tutorialWasShown}
                  onPress={() => {
                    sharedAppStateStore.skipping = true
                    this.props.vm.skip(this.props.todo)
                  }}
                  name="arrow_right_outline_28--forward"
                />
              )}
            {(this.props.type === CardType.current ||
              this.props.type === CardType.planning) && (
              <View
                onLayout={({ nativeEvent: { target } }: any) => {
                  BrakdownNodeId = target
                }}
              >
                <IconButton
                  disabled={
                    !sharedOnboardingStore.tutorialWasShown &&
                    sharedOnboardingStore.step !== TutorialStep.Breakdown
                  }
                  onPress={() => {
                    navigate('BreakdownTodo', {
                      breakdownTodo: this.props.todo,
                    })
                  }}
                  name="list_outline_28"
                />
              </View>
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
                disabled={!sharedOnboardingStore.tutorialWasShown}
                onPress={() => {
                  this.props.vm.complete(this.props.todo)
                }}
                name="done_outline_28--check"
                color={sharedColors.successIconColor}
                fullColor
              />
            )}
          </View>
        </View>
      </View>
    )
  }
}
