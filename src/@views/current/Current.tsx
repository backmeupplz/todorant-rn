import React, { Component } from 'react'
import { Text, View } from 'react-native'
import { createStackNavigator } from '@react-navigation/stack'
import { Container, Content, Card } from 'native-base'
import { fakeTodo } from '../../@models/Todo'
import { TodoCard } from '../../@components/TodoCard'

const Stack = createStackNavigator()

class CurrentContent extends Component {
  render() {
    return (
      <Container>
        <Content>
          <TodoCard todo={fakeTodo} />
        </Content>
      </Container>
    )
  }
}

export function Current() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Current" component={CurrentContent} />
    </Stack.Navigator>
  )
}
