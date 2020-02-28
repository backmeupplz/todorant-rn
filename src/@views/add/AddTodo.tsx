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
  Icon,
  View,
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
import DateTimePicker from '@react-native-community/datetimepicker'

enum AddTodoScreenType {
  add = 'add',
  edit = 'edit',
}

class TodoVM {
  @observable text = ''
  @observable completed = false
  @observable frog = false
  @observable monthAndYear?: string
  @observable date?: string
  @observable time?: string

  @observable showDatePicker = false
  @observable showMonthAndYearPicker = false
  @observable showTimePicker = false

  editedTodo?: Todo
  @observable showMore = false

  @observable order = 0

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
  get timePickerValue() {
    return this.time ? moment(this.time, 'HH:mm').toDate() : new Date()
  }
  set timePickerValue(value: Date | undefined) {
    this.time = value ? moment(value).format('HH:mm') : undefined
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
      this.order,
      this.monthAndYear!,
      false,
      this.date,
      this.time
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
    this.time = todo.time

    this.showMore = true
  }
}

@observer
class AddTodoForm extends Component<{ vm: TodoVM }> {
  render() {
    return (
      <>
        <Form>
          <Item>
            <Input
              placeholder="Text"
              value={this.props.vm.text}
              onChangeText={text => {
                this.props.vm.text = text
              }}
            />
          </Item>
          <Item
            onPress={() => {
              this.props.vm.showDatePicker = !this.props.vm.showDatePicker
              if (!this.props.vm.date) {
                this.props.vm.monthAndYear = undefined
                this.props.vm.date = undefined
              }
              this.props.vm.showMonthAndYearPicker = false
            }}
            style={{ paddingVertical: 16 }}
          >
            <Text
              style={{
                color:
                  this.props.vm.datePickerValue && !!this.props.vm.date
                    ? colors.text
                    : colors.placeholder,
              }}
            >
              {this.props.vm.datePickerValue && !!this.props.vm.date
                ? this.props.vm.datePickerValue
                : 'Select exact day'}
            </Text>
          </Item>
          {this.props.vm.showDatePicker && (
            <Calendar
              minDate={getDateString(new Date())}
              current={this.props.vm.datePickerValue || new Date()}
              markedDates={this.props.vm.markedDate}
              onDayPress={day => {
                this.props.vm.datePickerValue = day.dateString
                this.props.vm.showDatePicker = false
              }}
            />
          )}
          <Item
            onPress={() => {
              this.props.vm.showMonthAndYearPicker = !this.props.vm
                .showMonthAndYearPicker
              if (!!this.props.vm.date) {
                this.props.vm.monthAndYear = undefined
                this.props.vm.date = undefined
              }
              this.props.vm.showDatePicker = false
            }}
            style={{ paddingVertical: 16 }}
          >
            <Text
              style={{
                color:
                  this.props.vm.datePickerValue && !this.props.vm.date
                    ? colors.text
                    : colors.placeholder,
              }}
            >
              {this.props.vm.datePickerValue && !this.props.vm.date
                ? this.props.vm.datePickerValue
                : 'Or month'}
            </Text>
          </Item>
          {this.props.vm.showMonthAndYearPicker && (
            <MonthPicker
              selectedDate={this.props.vm.monthAndYearPickerValue}
              onMonthChange={(date: Moment) => {
                this.props.vm.monthAndYearPickerValue = date.toDate()
              }}
              minDate={moment()}
              maxDate={moment().add(100, 'years')}
            />
          )}
          {this.props.vm.showMore && (
            <Item
              style={{
                paddingVertical: this.props.vm.time ? 11 : 16,
                justifyContent: 'space-between',
              }}
            >
              <Text
                style={{
                  color: this.props.vm.time ? colors.text : colors.placeholder,
                  flex: 1,
                }}
                onPress={() => {
                  if (!this.props.vm.time) {
                    this.props.vm.timePickerValue = new Date()
                  }
                  this.props.vm.showTimePicker = !this.props.vm.showTimePicker
                }}
              >
                {this.props.vm.time ? this.props.vm.time : 'Exact time'}
              </Text>
              {!!this.props.vm.time && (
                <Button
                  icon
                  transparent
                  small
                  onPress={() => {
                    this.props.vm.time = undefined
                  }}
                >
                  <Icon type="MaterialIcons" name="close" />
                </Button>
              )}
            </Item>
          )}
          {this.props.vm.showTimePicker && (
            <DateTimePicker
              value={this.props.vm.timePickerValue || new Date()}
              mode="time"
              onChange={(event, date) => {
                this.props.vm.showTimePicker = false
                if (event.type === 'set') {
                  this.props.vm.timePickerValue = date
                }
              }}
            />
          )}
          <Item
            style={{ justifyContent: 'space-between', paddingVertical: 16 }}
          >
            <Text>It's a frog!</Text>
            <Switch
              value={this.props.vm.frog}
              onValueChange={value => {
                this.props.vm.frog = value
              }}
            />
          </Item>
          <Item
            style={{ justifyContent: 'space-between', paddingVertical: 16 }}
          >
            <Text>Completed</Text>
            <Switch
              value={this.props.vm.completed}
              onValueChange={value => {
                this.props.vm.completed = value
              }}
            />
          </Item>
          {!this.props.vm.showMore && (
            <Item>
              <Button
                block
                transparent
                onPress={() => {
                  this.props.vm.showMore = true
                }}
                style={{ flex: 1 }}
              >
                <Text>More...</Text>
              </Button>
            </Item>
          )}
        </Form>
      </>
    )
  }
}

@observer
class AddTodoContent extends Component<{
  route: RouteProp<
    Record<string, { editedTodo: Todo; breakdownTodo: Todo } | undefined>,
    string
  >
}> {
  @observable screenType = AddTodoScreenType.add
  @observable vms = [new TodoVM()]
  breakdownTodo?: Todo

  saveTodo() {
    const titlesToFixOrder = [] as string[]
    const addTodosOnTop = [] as Todo[]
    const addTodosToBottom = [] as Todo[]
    this.vms.forEach((vm, i) => {
      vm.order = i
    })
    for (const vm of this.vms) {
      const todo = vm.constructTodo()
      if (this.screenType === AddTodoScreenType.add) {
        todo._tempSyncId = uuid()
        sharedTodoStore.todos.unshift(todo)
        titlesToFixOrder.push(getTitle(todo))
        addTodosOnTop.push(todo)
      } else if (vm.editedTodo) {
        const oldTitle = getTitle(vm.editedTodo)

        vm.editedTodo.text = todo.text
        vm.editedTodo.completed = todo.completed
        vm.editedTodo.frog = todo.frog
        vm.editedTodo.monthAndYear = todo.monthAndYear
        vm.editedTodo.date = todo.date
        vm.editedTodo.time = todo.time

        sharedTodoStore.modify(vm.editedTodo)
        titlesToFixOrder.push(oldTitle, getTitle(vm.editedTodo))
      }
    }
    if (this.breakdownTodo) {
      this.breakdownTodo.completed = true
      sharedTodoStore.modify(this.breakdownTodo)
      titlesToFixOrder.push(getTitle(this.breakdownTodo))
    }
    fixOrder(titlesToFixOrder, addTodosOnTop, addTodosToBottom)
    sockets.sync()
    goBack()
  }

  @computed get isValid() {
    return this.vms.reduce((prev, cur) => {
      return !cur.isValid ? false : prev
    }, true)
  }

  componentDidMount() {
    if (this.props.route.params?.editedTodo) {
      this.vms[0].setEditedTodo(this.props.route.params.editedTodo)
      this.screenType = AddTodoScreenType.edit
    }
    if (this.props.route.params?.breakdownTodo) {
      this.breakdownTodo = this.props.route.params?.breakdownTodo
    }
  }

  render() {
    return (
      <Container>
        <Content>
          {this.vms.map((vm, i, a) => (
            <View key={i}>
              <AddTodoForm vm={vm} />
              {a.length > 1 && (
                <>
                  <Button
                    transparent
                    style={{
                      marginHorizontal: 10,
                      justifyContent: 'center',
                    }}
                    onPress={() => {
                      this.vms.splice(i, 1)
                    }}
                  >
                    <Text style={{ color: 'tomato' }}>Delete</Text>
                  </Button>
                  <View
                    style={{
                      flex: 1,
                      height: 2,
                      backgroundColor: 'lightsteelblue',
                    }}
                  />
                </>
              )}
            </View>
          ))}
          <Button
            block
            style={{ marginHorizontal: 10, marginTop: 10 }}
            onPress={() => {
              this.saveTodo()
            }}
            disabled={!this.isValid}
          >
            <Text>
              {this.screenType === AddTodoScreenType.add
                ? this.vms.length > 1
                  ? 'Add todos!'
                  : 'Add todo!'
                : 'Save todo!'}
            </Text>
          </Button>
          {this.screenType === AddTodoScreenType.add && (
            <Button
              transparent
              style={{
                marginHorizontal: 10,
                marginTop: 10,
                flex: 1,
                justifyContent: 'center',
              }}
              onPress={() => {
                this.vms.push(new TodoVM())
              }}
            >
              <Text>+</Text>
            </Button>
          )}
        </Content>
      </Container>
    )
  }
}

export const AddTodo = () => {
  const route = useRoute<
    RouteProp<
      Record<string, { editedTodo: Todo; breakdownTodo: Todo } | undefined>,
      string
    >
  >()
  return <AddTodoContent route={route} />
}
