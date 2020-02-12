import React, { Component } from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import { Container, Content } from 'native-base'
import { TodoCard } from '../../@components/TodoCard'
import ActionButton from 'react-native-action-button'
import { navigate } from '../../@utils/navigation'
import { AddTodo } from '../add/AddTodo'
import { sharedTodoStore } from '@stores/TodoStore'
import { observer } from 'mobx-react'
import { computed } from 'mobx'

const Stack = createStackNavigator()

class CurrentVM {
  @computed get currentTodo() {
    return sharedTodoStore.getCurrent()
  }
}

@observer
class CurrentContent extends Component {
  vm = new CurrentVM()

  render() {
    return (
      <Container>
        <Content>
          {!!this.vm.currentTodo && <TodoCard todo={this.vm.currentTodo} />}
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
    </Stack.Navigator>
  )
}
