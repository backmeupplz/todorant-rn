import React, { Component } from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import { Container, Content } from 'native-base'
import { fakeTodo } from '../../@models/Todo'
import { TodoCard } from '../../@components/TodoCard'
import ActionButton from 'react-native-action-button'
import { navigate } from '../../@utils/navigation'
import { AddTodo } from '../add/AddTodo'

const Stack = createStackNavigator()

class CurrentContent extends Component {
  render() {
    return (
      <Container>
        <Content>
          <TodoCard todo={fakeTodo} />
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
      <Stack.Screen name="AddTodo" component={AddTodo} />
    </Stack.Navigator>
  )
}
