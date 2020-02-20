import React, { Component } from 'react'
import { Todo, isTodoToday } from '../@models/Todo'
import { Card, CardItem, Body, Text, Button, Icon } from 'native-base'
import { sharedTodoStore } from '@stores/TodoStore'
import {
  getDateFromString,
  getDateDateString,
  getDateMonthAndYearString,
} from '@utils/time'

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
            <Text>
              {this.props.todo.frog ? '🐸 ' : ''}
              {this.props.todo.text}
            </Text>
          </Body>
        </CardItem>
        <CardItem footer style={{ justifyContent: 'flex-end' }}>
          {this.props.type !== CardType.current &&
            !isTodoToday(this.props.todo) && (
              <Button
                icon
                transparent
                small
                onPress={() => {
                  this.props.todo.date = getDateDateString(new Date())
                  this.props.todo.monthAndYear = getDateMonthAndYearString(
                    new Date()
                  )
                  sharedTodoStore.modify(this.props.todo)
                }}
              >
                <Icon type="MaterialIcons" name="arrow-upward" />
              </Button>
            )}
          <Button icon transparent small>
            <Icon
              type="MaterialIcons"
              name="delete"
              onPress={() => {
                this.props.todo.deleted = true
                sharedTodoStore.modify(this.props.todo)
              }}
            />
          </Button>
          {/* {this.props.type !== CardType.current && (
            <Button icon transparent small>
              <Icon type="MaterialIcons" name="edit" />
            </Button>
          )} */}
          {this.props.type === CardType.current && !this.props.todo.frog && (
            <>
              <Button icon transparent small>
                <Icon
                  type="MaterialIcons"
                  name="arrow-forward"
                  onPress={() => {
                    const nextTodo = sharedTodoStore
                      .todosForDate(
                        getDateFromString(
                          this.props.todo.monthAndYear,
                          this.props.todo.date
                        )
                      )
                      .find(todo => todo.order === this.props.todo.order + 1)
                    this.props.todo.order++
                    if (nextTodo) {
                      nextTodo.order--
                    } else {
                      sharedTodoStore.modify(this.props.todo)
                    }
                  }}
                />
              </Button>

              {/* <Button icon transparent small>
                <Icon type="MaterialIcons" name="list" />
              </Button> */}
            </>
          )}
          {this.props.type === CardType.done ? (
            <Button icon transparent small>
              <Icon
                type="MaterialIcons"
                name="repeat"
                onPress={() => {
                  this.props.todo.completed = false
                  sharedTodoStore.modify(this.props.todo)
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
                  sharedTodoStore.modify(this.props.todo)
                }}
              />
            </Button>
          )}
        </CardItem>
      </Card>
    )
  }
}
