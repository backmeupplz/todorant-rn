import React, { Component } from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import { Container, Content, View, Text, H1 } from 'native-base'
import { TodoCard, CardType } from '../../@components/TodoCard'
import ActionButton from 'react-native-action-button'
import { navigate } from '../../@utils/navigation'
import { AddTodo } from '../add/AddTodo'
import { sharedTodoStore } from '@stores/TodoStore'
import { observer } from 'mobx-react'
import { computed } from 'mobx'
import { Platform, ProgressViewIOS, ProgressBarAndroid } from 'react-native'

const Stack = createStackNavigator()

class CurrentVM {
  @computed get currentTodo() {
    return sharedTodoStore.currentTodo
  }
}

class ProgressBar extends Component<{ progress: number }> {
  render() {
    return Platform.OS === 'ios' ? (
      <ProgressViewIOS
        progress={this.props.progress}
        style={{ flex: 1, marginEnd: 12 }}
      />
    ) : (
      <ProgressBarAndroid
        styleAttr="Horizontal"
        indeterminate={false}
        progress={this.props.progress}
        style={{ flex: 1, marginEnd: 12 }}
      />
    )
  }
}

@observer
class CurrentContent extends Component {
  vm = new CurrentVM()

  render() {
    const progress = sharedTodoStore.propress.count
      ? sharedTodoStore.propress.completed / sharedTodoStore.propress.count
      : 1
    return (
      <Container>
        <Content>
          <View
            style={{
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              margin: 12,
            }}
          >
            <ProgressBar progress={progress} />
            <Text>
              {`${sharedTodoStore.propress.completed}/${sharedTodoStore.propress.count}`}
            </Text>
          </View>
          {!!this.vm.currentTodo && (
            <TodoCard todo={this.vm.currentTodo} type={CardType.current} />
          )}
          {!!sharedTodoStore.propress.count &&
            sharedTodoStore.propress.count ===
              sharedTodoStore.propress.completed && (
              <View
                style={{
                  flex: 1,
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <H1>🎉</H1>
                <H1>Congratulations!</H1>
                <Text style={{ textAlign: 'center' }}>
                  🥳 You did it! All the tasks for today are done, go get rest
                  or maybe dance a little 💃
                </Text>
              </View>
            )}
          {!sharedTodoStore.propress.count && (
            <View
              style={{
                flex: 1,
                flexDirection: 'column',
                alignItems: 'center',
                margin: 12,
              }}
            >
              <H1>🐝</H1>
              <H1>To infinity!</H1>
              <Text style={{ textAlign: 'center' }}>
                You don't have any todos for today. If you want to work — add a
                new todo for today or take the todos from future days.
              </Text>
            </View>
          )}
        </Content>
        <ActionButton
          buttonColor="tomato"
          onPress={() => {
            navigate('AddTodo')
          }}
        />
      </Container>
    )
  }
}

export function Current() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Current" component={CurrentContent} />
      <Stack.Screen
        name="AddTodo"
        component={AddTodo}
        options={{ title: 'Add todo' }}
      />
      <Stack.Screen
        name="BreakdownTodo"
        component={AddTodo}
        options={{ title: 'Breakdown todo' }}
      />
    </Stack.Navigator>
  )
}
