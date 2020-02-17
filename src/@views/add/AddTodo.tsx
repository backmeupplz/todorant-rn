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
import { Todo } from '@models/Todo'

class TodoVM {
  @observable text = ''
  @observable completed = false
  @observable frog = false
  @observable monthAndYear?: string
  @observable date?: string

  @observable showDatePicker = false
  @observable showMonthAndYearPicker = false

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
    return new Todo(
      new Date(),
      new Date(),
      this.text,
      this.completed,
      this.frog,
      0,
      false,
      0,
      this.monthAndYear!,
      this.date,
      undefined
    )
  }
}

@observer
export class AddTodo extends Component {
  vm = new TodoVM()

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
              sharedTodoStore.addTodo(this.vm.constructTodo())
              goBack()
            }}
            disabled={!this.vm.isValid}
          >
            <Text>Add todo!</Text>
          </Button>
        </Content>
      </Container>
    )
  }
}
