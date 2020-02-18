import React, { Component } from 'react'
import { Todo } from '../@models/Todo'
import { Card, CardItem, Body, Text, Button, Icon } from 'native-base'
import { sockets } from '@utils/sockets'

export enum CardType {
  done = 'done',
  planning = 'planning',
  current = 'current',
}

export class TodoCard extends Component<{ todo: Todo; type: CardType }> {
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
            <Icon
              type="MaterialIcons"
              name="delete"
              onPress={() => {
                this.props.todo.deleted = true
                sockets.sync()
              }}
            />
          </Button>
          {/* {this.props.type !== CardType.current && (
            <Button icon transparent small>
              <Icon type="MaterialIcons" name="edit" />
            </Button>
          )} */}
          {/* {this.props.type === CardType.current && (
            <>
              <Button icon transparent small>
                <Icon type="MaterialIcons" name="arrow-forward" />
              </Button>

              <Button icon transparent small>
                <Icon type="MaterialIcons" name="list" />
              </Button>
            </>
          )} */}
          {this.props.type === CardType.done ? (
            <Button icon transparent small>
              <Icon
                type="MaterialIcons"
                name="repeat"
                onPress={() => {
                  this.props.todo.completed = false
                  sockets.sync()
                }}
              />
            </Button>
          ) : (
            <Button icon transparent small>
              <Icon
                type="MaterialIcons"
                name="done"
                onPress={() => {
                  this.props.todo.completed = true
                  sockets.sync()
                }}
              />
            </Button>
          )}
        </CardItem>
      </Card>
    )
  }
}
