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
import { Todo, getTitle, isTodoOld } from '@models/Todo'
import { fixOrder } from '@utils/fixOrder'
import uuid from 'uuid'
import { useRoute, RouteProp } from '@react-navigation/native'
import DateTimePicker from '@react-native-community/datetimepicker'
import { sharedSettingsStore } from '@stores/SettingsStore'
import { realm } from '@utils/realm'
import { translate } from '@utils/i18n'
import { sharedColors } from '@utils/sharedColors'
import { Platform } from 'react-native'

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

  @observable addOnTop = false

  @observable collapsed = false

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

  constructor() {
    if (sharedSettingsStore.showTodayOnAddTodo) {
      this.date = getDateDateString(new Date())
      this.monthAndYear = getDateMonthAndYearString(new Date())
    }
    if (sharedSettingsStore.newTodosGoFirst) {
      this.addOnTop = true
    }
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
class CollapseButton extends Component<{ vm: TodoVM }> {
  render() {
    return (
      <Button
        icon
        transparent
        small
        onPress={() => {
          this.props.vm.collapsed = !this.props.vm.collapsed
        }}
      >
        <Icon
          type="MaterialIcons"
          name={
            this.props.vm.collapsed
              ? 'keyboard-arrow-down'
              : 'keyboard-arrow-up'
          }
          style={{
            color:
              !this.props.vm.collapsed || this.props.vm.isValid
                ? sharedColors.textColor
                : 'tomato',
          }}
        />
      </Button>
    )
  }
}

@observer
class AddTodoForm extends Component<{ vm: TodoVM }> {
  render() {
    return (
      <>
        {this.props.vm.collapsed ? (
          <Form>
            <Item
              style={{
                paddingTop: 10,
                paddingBottom: 10,
                borderColor: sharedColors.placeholderColor,
              }}
              onPress={() => {
                this.props.vm.collapsed = false
              }}
            >
              <View
                style={{
                  justifyContent: 'space-between',
                  flexDirection: 'row',
                  flex: 1,
                }}
              >
                <View
                  style={{
                    justifyContent: 'center',
                    flexDirection: 'column',
                  }}
                >
                  <Text>
                    {this.props.vm.frog && (
                      <Text {...sharedColors.textExtraStyle}>🐸 </Text>
                    )}
                    {this.props.vm.time && (
                      <Text {...sharedColors.textExtraStyle}>
                        {this.props.vm.time}{' '}
                      </Text>
                    )}
                    <Text {...sharedColors.textExtraStyle}>
                      {this.props.vm.text
                        ? this.props.vm.text
                        : translate('todo')}
                    </Text>
                  </Text>
                  {!!this.props.vm.monthAndYear && (
                    <Text
                      style={{
                        color: sharedColors.placeholderColor,
                        fontSize: 12,
                      }}
                    >{`${this.props.vm.monthAndYear}${
                      this.props.vm.date ? `-${this.props.vm.date}` : ''
                    }`}</Text>
                  )}
                </View>
                <CollapseButton vm={this.props.vm} />
              </View>
            </Item>
          </Form>
        ) : (
          <Form>
            <Item
              style={{
                justifyContent: 'space-between',
                borderColor: sharedColors.placeholderColor,
              }}
            >
              <Input
                placeholder={translate('text')}
                value={this.props.vm.text}
                onChangeText={text => {
                  this.props.vm.text = text
                }}
                placeholderTextColor={sharedColors.placeholderColor}
                style={{ color: sharedColors.textColor }}
              />
              <CollapseButton vm={this.props.vm} />
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
              style={{
                paddingVertical: 16,
                borderColor: sharedColors.placeholderColor,
              }}
            >
              <Text
                style={{
                  color:
                    this.props.vm.datePickerValue && !!this.props.vm.date
                      ? sharedColors.textColor
                      : sharedColors.placeholderColor,
                }}
              >
                {this.props.vm.datePickerValue && !!this.props.vm.date
                  ? this.props.vm.datePickerValue
                  : translate('addTodoDay')}
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
                theme={{
                  backgroundColor: sharedColors.backgroundColor,
                  calendarBackground: sharedColors.backgroundColor,
                  selectedDayBackgroundColor: 'dodgerblue',
                  textDisabledColor: sharedColors.placeholderColor,
                  dayTextColor: sharedColors.textColor,
                  textSectionTitleColor: sharedColors.textColor,
                  monthTextColor: sharedColors.textColor,
                }}
                firstDay={sharedSettingsStore.firstDayOfWeekSafe}
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
                if (
                  !this.props.vm.monthAndYear &&
                  this.props.vm.showMonthAndYearPicker
                ) {
                  this.props.vm.monthAndYear = getDateMonthAndYearString(
                    moment()
                      .add(1, 'month')
                      .toDate()
                  )
                }
              }}
              style={{
                paddingVertical: 16,
                borderColor: sharedColors.placeholderColor,
              }}
            >
              <Text
                style={{
                  color:
                    this.props.vm.datePickerValue && !this.props.vm.date
                      ? sharedColors.textColor
                      : sharedColors.placeholderColor,
                }}
              >
                {this.props.vm.datePickerValue && !this.props.vm.date
                  ? this.props.vm.datePickerValue
                  : translate('addTodoMonth')}
              </Text>
            </Item>
            {this.props.vm.showMonthAndYearPicker && (
              <MonthPicker
                selectedDate={this.props.vm.monthAndYearPickerValue}
                onMonthChange={(date: Moment) => {
                  this.props.vm.monthAndYearPickerValue = date.toDate()
                }}
                minDate={moment().add(1, 'month')}
                maxDate={moment().add(100, 'years')}
                containerStyle={{
                  backgroundColor: sharedColors.backgroundColor,
                }}
                monthTextStyle={sharedColors.textExtraStyle.style}
                yearTextStyle={sharedColors.textExtraStyle.style}
                selectedBackgroundColor={sharedColors.primaryColor}
                selectedMonthTextStyle={{
                  color: sharedColors.invertedTextColor,
                }}
                monthDisabledStyle={{ color: sharedColors.placeholderColor }}
                seperatorColor={sharedColors.placeholderColor}
                nextIcon={
                  <Icon
                    type="MaterialIcons"
                    name="keyboard-arrow-right"
                    style={{
                      color: sharedColors.textColor,
                    }}
                  />
                }
                prevIcon={
                  <Icon
                    type="MaterialIcons"
                    name="keyboard-arrow-left"
                    style={{
                      color: sharedColors.textColor,
                    }}
                  />
                }
              />
            )}
            {this.props.vm.showMore && (
              <Item
                style={{
                  paddingVertical: this.props.vm.time ? 11 : 16,
                  justifyContent: 'space-between',
                  borderColor: sharedColors.placeholderColor,
                }}
              >
                <Text
                  style={{
                    color: this.props.vm.time
                      ? sharedColors.textColor
                      : sharedColors.placeholderColor,
                    flex: 1,
                  }}
                  onPress={() => {
                    if (!this.props.vm.time) {
                      this.props.vm.timePickerValue = new Date()
                    }
                    this.props.vm.showTimePicker = !this.props.vm.showTimePicker
                  }}
                >
                  {this.props.vm.time
                    ? this.props.vm.time
                    : translate('addTodoTime')}
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
                    <Icon
                      type="MaterialIcons"
                      name="close"
                      style={{
                        color: sharedColors.textColor,
                      }}
                    />
                  </Button>
                )}
              </Item>
            )}
            {this.props.vm.showTimePicker && (
              <DateTimePicker
                value={this.props.vm.timePickerValue || new Date()}
                mode="time"
                onChange={(event, date) => {
                  if (Platform.OS === 'android') {
                    this.props.vm.showTimePicker = false
                  }
                  if (event.type === 'set' || Platform.OS === 'ios') {
                    this.props.vm.timePickerValue = date
                  }
                }}
              />
            )}
            <Item
              style={{
                justifyContent: 'space-between',
                paddingVertical: 16,
                paddingRight: 12,
                borderColor: sharedColors.placeholderColor,
              }}
            >
              <Text {...sharedColors.textExtraStyle}>
                {translate('addTodoFrog')}
              </Text>
              <Switch
                value={this.props.vm.frog}
                onValueChange={value => {
                  this.props.vm.frog = value
                }}
              />
            </Item>
            <Item
              style={{
                justifyContent: 'space-between',
                paddingVertical: 16,
                paddingRight: 12,
                borderColor: sharedColors.placeholderColor,
              }}
            >
              <Text {...sharedColors.textExtraStyle}>
                {translate('completed')}
              </Text>
              <Switch
                value={this.props.vm.completed}
                onValueChange={value => {
                  this.props.vm.completed = value
                }}
              />
            </Item>
            {this.props.vm.showMore && (
              <Item
                style={{
                  justifyContent: 'space-between',
                  paddingVertical: 16,
                  paddingRight: 12,
                  borderColor: sharedColors.placeholderColor,
                }}
              >
                <Text {...sharedColors.textExtraStyle}>
                  {translate('addTodoOnTop')}
                </Text>
                <Switch
                  value={this.props.vm.addOnTop}
                  onValueChange={value => {
                    this.props.vm.addOnTop = value
                  }}
                />
              </Item>
            )}
            {!this.props.vm.showMore && (
              <Item style={{ borderColor: sharedColors.placeholderColor }}>
                <Button
                  block
                  transparent
                  onPress={() => {
                    this.props.vm.showMore = true
                  }}
                  style={{ flex: 1 }}
                >
                  <Text style={{ color: sharedColors.primaryColor }}>
                    {translate('addTodoMore')}
                  </Text>
                </Button>
              </Item>
            )}
          </Form>
        )}
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
    const involvedTodos = [] as Todo[]
    this.vms.forEach((vm, i) => {
      vm.order = i
    })
    for (const vm of this.vms) {
      if (this.screenType === AddTodoScreenType.add) {
        const todo = {
          updatedAt: new Date(),
          createdAt: new Date(),
          text: vm.text,
          completed: vm.completed,
          frog: vm.frog,
          frogFails: 0,
          skipped: false,
          order: vm.order,
          monthAndYear:
            vm.monthAndYear || getDateMonthAndYearString(new Date()),
          deleted: false,
          date: vm.date,
          time: vm.time,

          _tempSyncId: uuid(),
        } as Todo
        todo._exactDate = new Date(getTitle(todo))

        realm.write(() => {
          const dbtodo = realm.create(Todo, todo)
          involvedTodos.push(dbtodo)
        })

        titlesToFixOrder.push(getTitle(todo))
        if (vm.addOnTop) {
          addTodosOnTop.push(todo)
        } else {
          addTodosToBottom.push(todo)
        }
      } else if (vm.editedTodo) {
        const oldTitle = getTitle(vm.editedTodo)
        const failed = isTodoOld(vm.editedTodo)

        realm.write(() => {
          if (!vm.editedTodo) {
            return
          }
          vm.editedTodo.text = vm.text
          vm.editedTodo.completed = vm.completed
          vm.editedTodo.frog = vm.frog
          vm.editedTodo.monthAndYear =
            vm.monthAndYear || getDateMonthAndYearString(new Date())
          vm.editedTodo.date = vm.date
          vm.editedTodo.time = vm.time
          vm.editedTodo.updatedAt = new Date()
          vm.editedTodo._exactDate = new Date(getTitle(vm.editedTodo))
          if (failed) {
            vm.editedTodo.frogFails++
            if (vm.editedTodo.frogFails > 1) {
              vm.editedTodo.frog = true
            }
          }
        })
        involvedTodos.push(vm.editedTodo)
        titlesToFixOrder.push(oldTitle, getTitle(vm.editedTodo))
      }
    }
    if (this.breakdownTodo) {
      const breakdownTodoTitle = getTitle(this.breakdownTodo)
      realm.write(() => {
        if (!this.breakdownTodo) {
          return
        }
        this.breakdownTodo.completed = true
        this.breakdownTodo.updatedAt = new Date()
      })
      titlesToFixOrder.push(breakdownTodoTitle)
    }
    fixOrder(titlesToFixOrder, addTodosOnTop, addTodosToBottom, involvedTodos)
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
        <Content style={{ backgroundColor: sharedColors.backgroundColor }}>
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
                      backgroundColor: sharedColors.specialSeparatorColor,
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
                  ? translate('addTodoPlural')
                  : translate('addTodoSingular')
                : translate('saveTodo')}
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
                this.vms.forEach(vm => {
                  vm.collapsed = true
                })
                this.vms.push(new TodoVM())
              }}
            >
              <Text style={{ color: sharedColors.primaryColor }}>+</Text>
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
