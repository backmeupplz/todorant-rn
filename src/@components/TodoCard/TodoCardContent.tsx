import React, { Component } from 'react'
import { observer } from 'mobx-react'
import { TodoCardVM } from '@components/TodoCard/TodoCardVM'
import { Todo } from '@models/Todo'
import { CardType } from '@components/TodoCard/CardType'
import { View } from 'native-base'
import { sharedColors } from '@utils/sharedColors'
import { TodoCardBody } from '@components/TodoCard/TodoCardBody'
import { TodoCardActions } from '@components/TodoCard/TodoCardActions'
import { DelegateCardActions } from '@components/TodoCard/DelegateCardActions'
import { Divider } from '@components/Divider'
import { FailCircle } from './FailCircle'
import { Vibration, Platform } from 'react-native'
import Swipeable from 'react-native-gesture-handler/Swipeable'
import CustomIcon from '@components/CustomIcon'
import { sharedSettingsStore } from '@stores/SettingsStore'
import { sharedOnboardingStore } from '@stores/OnboardingStore'
import { navigationRef } from '@utils/navigation'
import { MelonTodo, MelonUser } from '@models/MelonTodo'

export let currentTodoNodeId: number

@observer
export class TodoCardContent extends Component<{
  vm: TodoCardVM
  todo: MelonTodo
  delegator: MelonUser
  type: CardType
  drag?: () => void
  active?: boolean
}> {
  render() {
    let row: any
    return (
      <View
        onLayout={({ nativeEvent: { target } }: any) => {
          if (navigationRef.current?.getCurrentRoute()?.name === 'Current') {
            currentTodoNodeId = target
          }
        }}
      >
        <Swipeable
          enabled={
            sharedSettingsStore.swipeActions &&
            sharedOnboardingStore.tutorialIsShown
          }
          ref={(ref) => (row = ref)}
          leftThreshold={100}
          rightThreshold={100}
          onSwipeableWillOpen={() => {
            if (Platform.OS === 'android') {
              Vibration.vibrate(100)
            }
          }}
          onSwipeableLeftOpen={() => {
            row.close()
            this.props.vm.complete(this.props.todo)
          }}
          onSwipeableRightOpen={() => {
            row.close()
            this.props.vm.delete(this.props.todo)
          }}
          renderLeftActions={() => {
            if (
              (this.props.type === 'current' ||
                this.props.type === 'planning') &&
              sharedOnboardingStore.tutorialIsShown
            ) {
              return (
                <View
                  style={{
                    flex: 1,
                    justifyContent: 'center',
                    height: '98%',
                    backgroundColor: sharedColors.successIconColor,
                  }}
                >
                  <CustomIcon
                    name={'done_outline_28--check'}
                    size={36}
                    style={{
                      color: 'white',
                      opacity: 1.0,
                      marginHorizontal: 12,
                    }}
                  />
                </View>
              )
            }
          }}
          renderRightActions={() => {
            if (
              (this.props.type === 'current' ||
                this.props.type === 'planning') &&
              sharedOnboardingStore.tutorialIsShown
            ) {
              return (
                <View
                  style={{
                    flex: 1,
                    flexDirection: 'row-reverse',
                    alignItems: 'center',
                    height: '98%',
                    backgroundColor: sharedColors.destructIconColor,
                  }}
                >
                  <CustomIcon
                    name={'delete_outline_28-iOS'}
                    size={30}
                    style={{
                      color: 'white',
                      opacity: 1.0,
                      marginHorizontal: 12,
                    }}
                  />
                </View>
              )
            }
          }}
        >
          <View
            style={{
              paddingVertical: 10,
              backgroundColor: sharedColors.backgroundColor,
            }}
          >
            {!!this.props.todo.frogFails && (
              <View
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  paddingLeft: 16,
                  marginBottom: 6,
                }}
              >
                {Array(this.props.todo.frogFails)
                  .fill(0)
                  .map((_, i) => (
                    <FailCircle key={i} />
                  ))}
              </View>
            )}
            <TodoCardBody
              delegator={this.props.delegator}
              vm={this.props.vm}
              todo={this.props.todo}
              type={this.props.type}
              drag={
                this.props.type === CardType.planning &&
                sharedOnboardingStore.tutorialIsShown
                  ? this.props.drag
                  : undefined
              }
            />
            {this.props.type !== CardType.breakdown &&
              this.props.type !== CardType.delegation &&
              (this.props.vm.expanded ||
                this.props.type === CardType.current) && (
                <TodoCardActions
                  todo={this.props.todo}
                  type={this.props.type}
                  vm={this.props.vm}
                />
              )}
            {this.props.type === CardType.delegation && (
              <DelegateCardActions vm={this.props.vm} todo={this.props.todo} />
            )}
          </View>
          {!this.props.active && this.props.type !== CardType.current && (
            <Divider color={sharedColors.dividerColor} marginVertical={0} />
          )}
        </Swipeable>
      </View>
    )
  }
}
