import React, { Component } from 'react'
import { observer } from 'mobx-react'
import { TodoVM } from '@views/add/TodoVM'
import { sharedAppStateStore } from '@stores/AppStateStore'
import { Form, Item, View, Text, Input, Button, Icon } from 'native-base'
import { sharedColors } from '@utils/sharedColors'
import { translate } from '@utils/i18n'
import { CollapseButton } from './CollapseButton'
import { Platform, Clipboard } from 'react-native'
import { extraButtonProps } from '@utils/extraButtonProps'
import { Calendar } from 'react-native-calendars'
import { getDateString, getDateMonthAndYearString } from '@utils/time'
import { sharedSettingsStore } from '@stores/SettingsStore'
import moment, { Moment } from 'moment'
import MonthPicker from 'react-native-month-picker'
import DateTimePicker from '@react-native-community/datetimepicker'
import { Switch, FlatList } from 'react-native-gesture-handler'

@observer
export class AddTodoForm extends Component<{ vm: TodoVM }> {
  render() {
    const languageTag = sharedAppStateStore.languageTag
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
                    flex: 1,
                  }}
                >
                  <Text numberOfLines={1}>
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
                multiline
                placeholder={translate('text')}
                value={this.props.vm.text}
                onChangeText={(text) => {
                  this.props.vm.text = text
                }}
                placeholderTextColor={sharedColors.placeholderColor}
                style={{
                  color: sharedColors.textColor,
                  marginVertical: Platform.OS === 'ios' ? 10 : undefined,
                }}
              />
              {Platform.OS === 'android' && (
                <Button
                  icon
                  {...extraButtonProps(sharedColors)}
                  small
                  onPress={async () => {
                    const textFromClipboard = await Clipboard.getString()
                    this.props.vm.text = `${this.props.vm.text}${textFromClipboard}`
                  }}
                >
                  <Icon
                    type="MaterialIcons"
                    name="assignment"
                    style={{
                      color: sharedColors.textColor,
                    }}
                  />
                </Button>
              )}
              <CollapseButton vm={this.props.vm} />
            </Item>
            {!!this.props.vm.tags.length && (
              <Item
                style={{
                  justifyContent: 'space-between',
                  borderColor: sharedColors.placeholderColor,
                }}
              >
                <View
                  style={{
                    paddingVertical: 5,
                  }}
                >
                  <FlatList
                    horizontal
                    data={this.props.vm.tags}
                    keyExtractor={(_, index) => `${index}`}
                    renderItem={({ item }) => {
                      return (
                        <Button
                          {...extraButtonProps(sharedColors)}
                          onPress={() => {
                            this.props.vm.applyTag(item)
                          }}
                        >
                          <Text
                            style={{
                              color: item.color || 'dodgerblue',
                              padding: 10,
                            }}
                          >
                            #{item.tag}
                          </Text>
                        </Button>
                      )
                    }}
                  />
                </View>
              </Item>
            )}
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
                onDayPress={(day) => {
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
                    moment().add(1, 'month').toDate()
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
                localeLanguage={languageTag}
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
                    {...extraButtonProps(sharedColors)}
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
                    if (
                      !this.props.vm.datePickerValue &&
                      !this.props.vm.monthAndYearPickerValue
                    ) {
                      this.props.vm.datePickerValue = getDateString(new Date())
                    }
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
                onValueChange={(value) => {
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
                onValueChange={(value) => {
                  this.props.vm.completed = value
                }}
              />
            </Item>
            {this.props.vm.showMore && !this.props.vm.editedTodo && (
              <Item
                style={{
                  justifyContent: 'space-between',
                  paddingVertical: 16,
                  paddingRight: 12,
                  borderColor: sharedColors.placeholderColor,
                  flex: 1,
                }}
              >
                <Text {...sharedColors.textExtraStyle}>
                  {translate('addTodoOnTop')}
                </Text>
                <Switch
                  value={this.props.vm.addOnTop}
                  onValueChange={(value) => {
                    this.props.vm.addOnTop = value
                  }}
                />
              </Item>
            )}
            {!this.props.vm.showMore && (
              <Item style={{ borderColor: sharedColors.placeholderColor }}>
                <Button
                  block
                  {...extraButtonProps(sharedColors)}
                  style={{
                    ...extraButtonProps(sharedColors).style,
                    flex: 1,
                  }}
                  onPress={() => {
                    this.props.vm.showMore = true
                  }}
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
