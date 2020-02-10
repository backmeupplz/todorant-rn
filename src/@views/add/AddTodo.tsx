import React, { Component } from 'react'
import {
  Container,
  Content,
  Form,
  Item,
  Input,
  Label,
  Text,
  Switch,
  Button,
} from 'native-base'
import { goBack } from '../../@utils/navigation'

export class AddTodo extends Component {
  render() {
    return (
      <Container>
        <Content>
          <Form>
            <Item floatingLabel>
              <Label>Text</Label>
              <Input />
            </Item>
            <Item
              style={{ justifyContent: 'space-between', paddingVertical: 10 }}
            >
              <Text>It's a frog!</Text>
              <Switch />
            </Item>
            <Item
              style={{ justifyContent: 'space-between', paddingVertical: 10 }}
            >
              <Text>Completed</Text>
              <Switch />
            </Item>
          </Form>
          <Button
            block
            style={{ marginHorizontal: 10, marginTop: 10 }}
            onPress={() => {
              goBack()
            }}
          >
            <Text>Add todo!</Text>
          </Button>
        </Content>
      </Container>
    )
  }
}
