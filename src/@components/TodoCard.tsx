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
import { navigate } from '@utils/navigation'
import { l } from '@utils/linkify'
import { Linking, Platform } from 'react-native'
import { sharedAppStateStore } from '@stores/AppStateStore'
import { alertConfirm } from '@utils/alert'
import { computed } from 'mobx'
import moment from 'moment'
import { realm } from '@utils/realm'
import { translate } from '@utils/i18n'
import { sharedColors } from '@utils/sharedColors'
import { TouchableHighlight } from 'react-native-gesture-handler'

export enum CardType {
  done = 'done',
  planning = 'planning',
  current = 'current',
}

class TodoCardVM {
  skip(todo: Todo) {
    const neighbours = sharedTodoStore
      .todosForDate(getDateFromString(todo.monthAndYear, todo.date))
      .filtered(`completed = ${todo.completed}`)
    let startOffseting = false
    let offset = 0
    realm.write(() => {
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
    })

    fixOrder([getTitle(todo)])
  }

  isLast(todo: Todo) {
    const neighbours = sharedTodoStore
      .todosForDate(getDateFromString(todo.monthAndYear, todo.date))
      .filtered(`completed = ${todo.completed}`)
    return neighbours.length <= 1
  }

  moveToToday(todo: Todo) {
    const oldTitle = getTitle(todo)
    realm.write(() => {
      todo.date = getDateDateString(new Date())
      todo.monthAndYear = getDateMonthAndYearString(new Date())
      todo._exactDate = new Date(getTitle(todo))
      todo.updatedAt = new Date()
    })

    fixOrder([oldTitle, getTitle(todo)])
  }

  delete(todo: Todo) {
    alertConfirm(
      `${translate('deleteTodo')} "${
        todo.text.length > 50 ? `${todo.text.substr(0, 50)}...` : todo.text
      }"?`,
      translate('delete'),
      () => {
        realm.write(() => {
          todo.deleted = true
          todo.updatedAt = new Date()
        })

        fixOrder([getTitle(todo)])
      }
    )
  }

  uncomplete(todo: Todo) {
    realm.write(() => {
      todo.completed = false
      todo.updatedAt = new Date()
    })

    fixOrder([getTitle(todo)])
  }

  complete(todo: Todo) {
    realm.write(() => {
      todo.completed = true
      todo.updatedAt = new Date()
    })

    fixOrder([getTitle(todo)])
  }
}

@observer
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
            style={{
              color: p.type !== 'text' ? 'dodgerblue' : sharedColors.textColor,
            }}
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
class DebugTodoInfo extends Component<{ todo: Todo }> {
  render() {
    return (
      <>
        <Text {...sharedColors.textExtraStyle}>
          {this.props.todo._id || 'no id'}
        </Text>
        <Text {...sharedColors.textExtraStyle}>
          {this.props.todo._tempSyncId || 'no sync id'}
        </Text>
        <Text {...sharedColors.textExtraStyle}>
          {this.props.todo.createdAt
            ? moment(this.props.todo.createdAt).format('YYYY-MM-DD hh:mm:ss')
            : 'no created at'}
        </Text>
        <Text {...sharedColors.textExtraStyle}>
          {this.props.todo.updatedAt
            ? moment(this.props.todo.updatedAt).format('YYYY-MM-DD hh:mm:ss')
            : 'no updated at'}
        </Text>
      </>
    )
  }
}

@observer
class TodoCardTextBlock extends Component<{ todo: Todo; isOld: boolean }> {
  render() {
    return (
      <Text>
        <Text {...sharedColors.textExtraStyle}>
          {this.props.isOld && <Text style={{ color: 'tomato' }}>! </Text>}
          {__DEV__ && `(${this.props.todo.order}) `}
          {this.props.todo.frog ? '🐸 ' : ''}
          {this.props.todo.time ? `${this.props.todo.time} ` : ''}
        </Text>
        <TodoText
          text={this.props.todo.text}
          isOld={this.props.isOld}
        ></TodoText>
      </Text>
    )
  }
}

@observer
export class TodoCard extends Component<{
  todo: Todo
  type: CardType
  drag?: () => void
}> {
  vm = new TodoCardVM()

  @computed get isOld() {
    return this.props.type !== CardType.done && isTodoOld(this.props.todo)
  }

  render() {
    return (
      <Card
        style={{
          backgroundColor: sharedColors.backgroundColor,
          borderColor: sharedColors.borderColor,
        }}
      >
        {Platform.OS === 'android' ? (
          <CardItem
            style={{
              backgroundColor: this.isOld
                ? sharedColors.oldTodoBackground
                : undefined,
            }}
          >
            <Body>
              {__DEV__ && <DebugTodoInfo todo={this.props.todo} />}
              <TodoCardTextBlock todo={this.props.todo} isOld={this.isOld} />
            </Body>
          </CardItem>
        ) : (
          <TouchableHighlight
            onLongPress={this.props.drag}
            onPress={() => {
              navigate('EditTodo', { editedTodo: this.props.todo })
            }}
          >
            <CardItem
              style={{
                backgroundColor: this.isOld
                  ? sharedColors.oldTodoBackground
                  : undefined,
              }}
            >
              <Body>
                {__DEV__ && <DebugTodoInfo todo={this.props.todo} />}
                <TodoCardTextBlock todo={this.props.todo} isOld={this.isOld} />
              </Body>
            </CardItem>
          </TouchableHighlight>
        )}
        <CardItem
          footer
          style={{
            justifyContent: 'space-between',
            backgroundColor: 'transparrent',
          }}
        >
          {this.props.todo.skipped && (
            <View>
              <Text {...sharedColors.textExtraStyle}>
                ({translate('skipped')})
              </Text>
            </View>
          )}
          <View
            style={{
              flexDirection: 'row',
              flex: 1,
              justifyContent: 'flex-end',
            }}
          >
            {this.props.type === CardType.planning &&
              !isTodoToday(this.props.todo) && (
                <Button
                  icon
                  transparent
                  onPress={() => {
                    this.vm.moveToToday(this.props.todo)
                  }}
                >
                  <Icon
                    type="MaterialIcons"
                    name="arrow-upward"
                    {...sharedColors.iconExtraStyle}
                    {...sharedColors.iconExtraStyle}
                  />
                </Button>
              )}
            <Button icon transparent>
              <Icon
                type="MaterialIcons"
                name="delete"
                onPress={() => {
                  this.vm.delete(this.props.todo)
                }}
                style={{ color: sharedColors.primaryColor }}
                {...sharedColors.iconExtraStyle}
              />
            </Button>
            {this.props.type !== CardType.current && (
              <Button
                icon
                transparent
                onPress={() => {
                  navigate('EditTodo', { editedTodo: this.props.todo })
                }}
              >
                <Icon
                  type="MaterialIcons"
                  name="edit"
                  {...sharedColors.iconExtraStyle}
                />
              </Button>
            )}
            {this.props.type === CardType.current &&
              !this.props.todo.frog &&
              !this.vm.isLast(this.props.todo) && (
                <>
                  <Button icon transparent>
                    <Icon
                      type="MaterialIcons"
                      name="arrow-forward"
                      onPress={() => {
                        this.vm.skip(this.props.todo)
                      }}
                      {...sharedColors.iconExtraStyle}
                    />
                  </Button>

                  <Button
                    icon
                    transparent
                    onPress={() => {
                      navigate('BreakdownTodo', {
                        breakdownTodo: this.props.todo,
                      })
                    }}
                  >
                    <Icon
                      type="MaterialIcons"
                      name="list"
                      {...sharedColors.iconExtraStyle}
                    />
                  </Button>
                </>
              )}
            {this.props.type === CardType.done ? (
              <Button icon transparent>
                <Icon
                  type="MaterialIcons"
                  name="repeat"
                  onPress={() => {
                    this.vm.uncomplete(this.props.todo)
                  }}
                  {...sharedColors.iconExtraStyle}
                />
              </Button>
            ) : (
              <Button icon transparent>
                <Icon
                  type="MaterialIcons"
                  name="done"
                  onPress={() => {
                    this.vm.complete(this.props.todo)
                  }}
                  {...sharedColors.iconExtraStyle}
                />
              </Button>
            )}
          </View>
        </CardItem>
      </Card>
    )
  }
}
