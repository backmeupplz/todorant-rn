import React, { Component } from 'react'
import { Todo } from '../@models/Todo'
import { Card, CardItem, Body, Text, Button, Icon } from 'native-base'

export class TodoCard extends Component<{ todo: Todo }> {
  render() {
    return (
      <Card>
        <CardItem>
          <Body>
            <Text>{this.props.todo.text}</Text>
          </Body>
        </CardItem>
        <CardItem footer style={{ justifyContent: 'flex-end' }}>
          <Button icon transparent small>
            <Icon type="MaterialIcons" name="delete" />
          </Button>
          <Button icon transparent small>
            <Icon type="MaterialIcons" name="arrow-forward" />
          </Button>
          <Button icon transparent small>
            <Icon type="MaterialIcons" name="list" />
          </Button>
          <Button icon transparent small>
            <Icon type="MaterialIcons" name="done" />
          </Button>
        </CardItem>
      </Card>
    )
  }
}
