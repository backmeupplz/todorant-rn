import React, { Component } from 'react'
import { Todo, isTodoToday, getTitle, isTodoOld } from '../@models/Todo'
import { Card, CardItem, Body, Text, Button, Icon, View } from 'native-base'
import { sharedTodoStore } from '@stores/TodoStore'
import {
  getDateFromString,
  getDateDateString,
  getDateMonthAndYearString,
} from '@utils/time'
import { observer } from 'mobx-react'
import { fixOrder } from '@utils/fixOrder'
import { sockets } from '@utils/sockets'
import { navigate } from '@utils/navigation'
import { l } from '@utils/linkify'
import { Linking } from 'react-native'
import { sharedAppStateStore } from '@stores/AppStateStore'
import { alertConfirm } from '@utils/alert'
import { computed } from 'mobx'

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
    // Save
    sharedTodoStore.modify(todo)
    fixOrder([getTitle(todo)])
    sockets.todoSyncManager.sync()
  }

  isLast(todo: Todo) {
    const neighbours = sharedTodoStore
      .todosForDate(getDateFromString(todo.monthAndYear, todo.date))
      .filter(t => t.completed === todo.completed)
    return neighbours.length <= 1
  }

  moveToToday(todo: Todo) {
    const oldTitle = getTitle(todo)
    todo.date = getDateDateString(new Date())
    todo.monthAndYear = getDateMonthAndYearString(new Date())
    // Save
    sharedTodoStore.modify(todo)
    fixOrder([oldTitle, getTitle(todo)])
    sockets.todoSyncManager.sync()
  }

  delete(todo: Todo) {
    alertConfirm(
      `Would you really like to delete "${
        todo.text.length > 50 ? `${todo.text.substr(0, 50)}...` : todo.text
      }"?`,
      'Delete',
      () => {
        todo.deleted = true
        // Save
        sharedTodoStore.modify(todo)
        fixOrder([getTitle(todo)])
        sockets.todoSyncManager.sync()
      }
    )
  }

  uncomplete(todo: Todo) {
    todo.completed = false
    // Save
    sharedTodoStore.modify(todo)
    fixOrder([getTitle(todo)])
    sockets.todoSyncManager.sync()
  }

  complete(todo: Todo) {
    todo.completed = true
    // Save
    sharedTodoStore.modify(todo)
    fixOrder([getTitle(todo)])
    sockets.todoSyncManager.sync()
  }
}

class TodoText extends Component<{ text: string; isOld: boolean }> {
  get linkifiedText() {
    return l(this.props.text)
  }

  render() {
    return (
      <Text>
        {this.linkifiedText.map((p, i) => (
          <Text
            key={i}
            style={{ color: p.type !== 'text' ? 'dodgerblue' : undefined }}
            onPress={() => {
              if (p.type === 'link' && p.url) {
                Linking.openURL(p.url)
              } else if (p.type === 'hash') {
                sharedAppStateStore.hash = p.value
              }
            }}
          >
            {p.value}
          </Text>
        ))}
      </Text>
    )
  }
}

@observer
export class TodoCard extends Component<{ todo: Todo; type: CardType }> {
  vm = new TodoCardVM()

  @computed get isOld() {
    return this.props.type !== CardType.done && isTodoOld(this.props.todo)
  }

  render() {
    return (
      <Card>
        <CardItem
          style={{ backgroundColor: this.isOld ? 'lavenderblush' : undefined }}
        >
          <Body>
            <Text>
              <Text>
                {this.isOld && <Text style={{ color: 'tomato' }}>! </Text>}
                {__DEV__ && `(${this.props.todo.order}) `}
                {this.props.todo.frog ? '🐸 ' : ''}
                {this.props.todo.time ? `${this.props.todo.time} ` : ''}
              </Text>
              <TodoText
                text={this.props.todo.text}
                isOld={this.isOld}
              ></TodoText>
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
                    this.vm.moveToToday(this.props.todo)
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
                  this.vm.delete(this.props.todo)
                }}
              />
            </Button>
            {this.props.type !== CardType.current && (
              <Button
                icon
                transparent
                small
                onPress={() => {
                  navigate('EditTodo', { editedTodo: { ...this.props.todo } })
                }}
              >
                <Icon type="MaterialIcons" name="edit" />
              </Button>
            )}
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

                  <Button
                    icon
                    transparent
                    small
                    onPress={() => {
                      navigate('BreakdownTodo', {
                        breakdownTodo: { ...this.props.todo },
                      })
                    }}
                  >
                    <Icon type="MaterialIcons" name="list" />
                  </Button>
                </>
              )}
            {this.props.type === CardType.done ? (
              <Button icon transparent small>
                <Icon
                  type="MaterialIcons"
                  name="repeat"
                  onPress={() => {
                    this.vm.uncomplete(this.props.todo)
                  }}
                />
              </Button>
            ) : (
              <Button icon transparent small>
                <Icon
                  type="MaterialIcons"
                  name="done"
                  onPress={() => {
                    this.vm.complete(this.props.todo)
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
