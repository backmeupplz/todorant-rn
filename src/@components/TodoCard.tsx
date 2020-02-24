import React, { Component } from 'react'
import { Todo, isTodoToday } from '../@models/Todo'
import { Card, CardItem, Body, Text, Button, Icon, View } from 'native-base'
import { sharedTodoStore } from '@stores/TodoStore'
import {
  getDateFromString,
  getDateDateString,
  getDateMonthAndYearString,
} from '@utils/time'
import { observer } from 'mobx-react'

export enum CardType {
  done = 'done',
  planning = 'planning',
  current = 'current',
}

class TodoCardVM {
  skip(todo: Todo) {
    const neighbours = sharedTodoStore
      .todosForDate(getDateFromString(todo.monthAndYear, todo.date))
      .filter(t => t.completed === todo.completed)
    let startOffseting = false
    let offset = 0
    for (const t of neighbours) {
      if (t._id === todo._id) {
        startOffseting = true
        continue
      }
      if (startOffseting) {
        offset++
        if (!t.skipped) {
          t.order -= offset
          t.updatedAt = new Date()
          break
        }
      }
    }
    todo.order += offset
    todo.skipped = true
    todo.updatedAt = new Date()
  }

  isLast(todo: Todo) {
    const neighbours = sharedTodoStore
      .todosForDate(getDateFromString(todo.monthAndYear, todo.date))
      .filter(t => t.completed === todo.completed)
    return neighbours.length <= 1
  }
}

@observer
export class TodoCard extends Component<{ todo: Todo; type: CardType }> {
  vm = new TodoCardVM()

  render() {
    return (
      <Card>
        <CardItem>
          <Body>
            <Text>
              {__DEV__ && `(${this.props.todo.order}) `}
              {this.props.todo.frog ? '🐸 ' : ''}
              {this.props.todo.text}
            </Text>
          </Body>
        </CardItem>
        <CardItem footer style={{ justifyContent: 'space-between' }}>
          {this.props.todo.skipped && (
            <View>
              <Text>(Skipped)</Text>
            </View>
          )}
          <View
            style={{
              flexDirection: 'row',
              flex: 1,
              justifyContent: 'flex-end',
            }}
          >
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
            {this.props.type === CardType.current &&
              !this.props.todo.frog &&
              !this.vm.isLast(this.props.todo) && (
                <>
                  <Button icon transparent small>
                    <Icon
                      type="MaterialIcons"
                      name="arrow-forward"
                      onPress={() => {
                        this.vm.skip(this.props.todo)
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
          </View>
        </CardItem>
      </Card>
    )
  }
}
