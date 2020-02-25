import React, { Component } from 'react'
import {
  Container,
  Content,
  Form,
  Item,
  Input,
  Text,
  Switch,
  Button,
} from 'native-base'
import { goBack } from '@utils/navigation'
import { observer } from 'mobx-react'
import { observable, computed } from 'mobx'
import { Calendar } from 'react-native-calendars'
import {
  getDateFromString,
  getDateMonthAndYearString,
  getDateDateString,
  getDateString,
} from '@utils/time'
import MonthPicker from 'react-native-month-picker'
import moment, { Moment } from 'moment'
import { colors } from '@utils/colors'
import { sharedTodoStore } from '@stores/TodoStore'
import { Todo, getTitle } from '@models/Todo'
import { sockets } from '@utils/sockets'
import { fixOrder } from '@utils/fixOrder'
import uuid from 'uuid'
import { useRoute, RouteProp } from '@react-navigation/native'

enum AddTodoScreenType {
  add = 'add',
  edit = 'edit',
}

class TodoVM {
  @observable screenType = AddTodoScreenType.add

  @observable text = ''
  @observable completed = false
  @observable frog = false
  @observable monthAndYear?: string
  @observable date?: string

  @observable showDatePicker = false
  @observable showMonthAndYearPicker = false

  editedTodo?: Todo

  @computed
  get datePickerValue() {
    return this.monthAndYear
      ? getDateString(getDateFromString(this.monthAndYear, this.date))
      : undefined
  }
  set datePickerValue(value: string | undefined) {
    if (!value) {
      this.monthAndYear = undefined
      this.date = undefined
      return
    }
    if (this.showDatePicker) {
      this.monthAndYear = getDateMonthAndYearString(value)
      this.date = getDateDateString(value)
    }
  }

  @computed
  get monthAndYearPickerValue() {
    return this.monthAndYear
      ? getDateFromString(this.monthAndYear, this.date)
      : undefined
  }
  set monthAndYearPickerValue(value: Date | undefined) {
    if (!value) {
      this.monthAndYear = undefined
      this.date = undefined
      return
    }
    if (this.showMonthAndYearPicker) {
      this.monthAndYear = getDateMonthAndYearString(value)
      this.date = undefined
    }
  }

  @computed
  get markedDate() {
    const result = {} as { [index: string]: { selected: boolean } }
    if (this.datePickerValue) {
      result[this.datePickerValue] = { selected: true }
    }
    return result
  }

  @computed
  get isValid() {
    return !!this.text && !!this.monthAndYear
  }

  constructTodo() {
    const todo = new Todo(
      this.text,
      this.completed,
      this.frog,
      0,
      false,
      0,
      this.monthAndYear!,
      false,
      this.date,
      undefined
    )
    todo.createdAt = new Date()
    todo.updatedAt = new Date()
    return todo
  }

  setEditedTodo(todo: Todo) {
    this.editedTodo = todo

    this.text = todo.text
    this.completed = todo.completed
    this.frog = todo.frog
    this.monthAndYear = todo.monthAndYear
    this.date = todo.date

    this.screenType = AddTodoScreenType.edit
  }

  saveTodo() {
    const todo = this.constructTodo()
    if (this.screenType === AddTodoScreenType.add) {
      todo._tempSyncId = uuid()
      sharedTodoStore.todos.unshift(todo)
      fixOrder([getTitle(todo)], [todo])
    } else if (this.editedTodo) {
      const oldTitle = getTitle(this.editedTodo)

      this.editedTodo.text = todo.text
      this.editedTodo.completed = todo.completed
      this.editedTodo.frog = todo.frog
      this.editedTodo.monthAndYear = todo.monthAndYear
      this.editedTodo.date = todo.date

      sharedTodoStore.modify(this.editedTodo)
      fixOrder([oldTitle, getTitle(this.editedTodo)])
    }
    sockets.sync()
    goBack()
  }
}

@observer
class AddTodoContent extends Component<{
  route: RouteProp<Record<string, { editedTodo: Todo } | undefined>, string>
}> {
  vm = new TodoVM()

  componentDidMount() {
    if (this.props.route.params?.editedTodo) {
      this.vm.setEditedTodo(this.props.route.params.editedTodo)
    }
  }

  render() {
    return (
      <Container>
        <Content>
          <Form>
            <Item>
              <Input
                placeholder="Text"
                value={this.vm.text}
                onChangeText={text => {
                  this.vm.text = text
                }}
              />
            </Item>
            <Item
              onPress={() => {
                this.vm.showDatePicker = !this.vm.showDatePicker
                if (!this.vm.date) {
                  this.vm.monthAndYear = undefined
                  this.vm.date = undefined
                }
                this.vm.showMonthAndYearPicker = false
              }}
              style={{ paddingVertical: 16 }}
            >
              <Text
                style={{
                  color:
                    this.vm.datePickerValue && !!this.vm.date
                      ? colors.text
                      : colors.placeholder,
                }}
              >
                {this.vm.datePickerValue && !!this.vm.date
                  ? this.vm.datePickerValue
                  : 'Select exact day'}
              </Text>
            </Item>
            {this.vm.showDatePicker && (
              <Calendar
                minDate={getDateString(new Date())}
                current={this.vm.datePickerValue || new Date()}
                markedDates={this.vm.markedDate}
                onDayPress={day => {
                  this.vm.datePickerValue = day.dateString
                  this.vm.showDatePicker = false
                }}
              />
            )}
            <Item
              onPress={() => {
                this.vm.showMonthAndYearPicker = !this.vm.showMonthAndYearPicker
                if (!!this.vm.date) {
                  this.vm.monthAndYear = undefined
                  this.vm.date = undefined
                }
                this.vm.showDatePicker = false
              }}
              style={{ paddingVertical: 16 }}
            >
              <Text
                style={{
                  color:
                    this.vm.datePickerValue && !this.vm.date
                      ? colors.text
                      : colors.placeholder,
                }}
              >
                {this.vm.datePickerValue && !this.vm.date
                  ? this.vm.datePickerValue
                  : 'Or month'}
              </Text>
            </Item>
            {this.vm.showMonthAndYearPicker && (
              <MonthPicker
                selectedDate={this.vm.monthAndYearPickerValue}
                onMonthChange={(date: Moment) => {
                  this.vm.monthAndYearPickerValue = date.toDate()
                }}
                minDate={moment()}
                maxDate={moment().add(100, 'years')}
              />
            )}
            <Item
              style={{ justifyContent: 'space-between', paddingVertical: 16 }}
            >
              <Text>It's a frog!</Text>
              <Switch
                value={this.vm.frog}
                onValueChange={value => {
                  this.vm.frog = value
                }}
              />
            </Item>
            <Item
              style={{ justifyContent: 'space-between', paddingVertical: 16 }}
            >
              <Text>Completed</Text>
              <Switch
                value={this.vm.completed}
                onValueChange={value => {
                  this.vm.completed = value
                }}
              />
            </Item>
          </Form>
          <Button
            block
            style={{ marginHorizontal: 10, marginTop: 10 }}
            onPress={() => {
              this.vm.saveTodo()
            }}
            disabled={!this.vm.isValid}
          >
            <Text>
              {this.vm.screenType === AddTodoScreenType.add
                ? 'Add todo!'
                : 'Save todo!'}
            </Text>
          </Button>
        </Content>
      </Container>
    )
  }
}

export const AddTodo = () => {
  const route = useRoute<
    RouteProp<Record<string, { editedTodo: Todo } | undefined>, string>
  >()
  return <AddTodoContent route={route}></AddTodoContent>
}
