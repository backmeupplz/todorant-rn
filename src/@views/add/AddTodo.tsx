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
import { goBack } from '../../@utils/navigation'
import { observer } from 'mobx-react'
import { observable, computed } from 'mobx'
import { Calendar } from 'react-native-calendars'
import {
  getDateFromString,
  getDateMonthAndYearString,
  getDateDateString,
  getDateString,
  getDateFromFullString,
} from '../../@utils/time'

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
  get markedDate() {
    const result = {} as { [index: string]: { selected: boolean } }
    if (this.datePickerValue) {
      result[this.datePickerValue] = { selected: true }
    }
    return result
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
                if (this.vm.showDatePicker) {
                  this.vm.showMonthAndYearPicker = false
                }
              }}
              style={{ paddingVertical: 16 }}
            >
              <Text>
                {this.vm.datePickerValue
                  ? this.vm.datePickerValue
                  : 'Exact day'}
              </Text>
            </Item>
            {this.vm.showDatePicker && (
              <Calendar
                current={this.vm.datePickerValue || new Date()}
                markedDates={this.vm.markedDate}
                onDayPress={day => {
                  this.vm.datePickerValue = day.dateString
                  this.vm.showDatePicker = false
                }}
              />
            )}
            <Item>
              <Input
                placeholder="Or month"
                value={this.vm.text}
                onChangeText={text => {
                  this.vm.text = text
                }}
              />
            </Item>
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
