import React, { Component } from 'react'
import { Text, ActionSheet, View, Icon } from 'native-base'
import { sharedSettingsStore } from '@stores/SettingsStore'
import { sockets } from '@utils/sockets'
import { observer } from 'mobx-react'
import { TouchableOpacity } from 'react-native-gesture-handler'
import { translate } from '@utils/i18n'
import { sharedColors } from '@utils/sharedColors'
import { navigate } from '@utils/navigation'
import { TableItem } from '@components/TableItem'
import { Platform } from 'react-native'
import DateTimePicker from '@react-native-community/datetimepicker'
import { observable, computed, makeObservable } from 'mobx'
import { TextAndSwitch } from '@views/settings/TextAndSwitch'
import {
  getNotificationPermissions,
  scheduleReminders,
  stopReminders,
} from '@utils/notifications'
import PushNotification from 'react-native-push-notification'

@observer
class TimePickerRow extends Component<{
  title: string
  showClearButton: boolean
  onClear: () => void
  value: string
  pickerValue: Date
  onSet: (date: Date) => void
}> {
  @observable showTimePicker = false
  @observable clearTime = false

  componentWillMount() {
    makeObservable(this)
  }

  render() {
    return (
      <>
        <TableItem
          onPress={() => {
            if (!this.clearTime) {
              this.showTimePicker = !this.showTimePicker
            }
            this.clearTime = false
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text
              style={{ flex: 1, ...sharedColors.regularTextExtraStyle.style }}
            >
              {translate(this.props.title)}
            </Text>
            <Text {...sharedColors.textExtraStyle}>{this.props.value}</Text>

            {this.props.showClearButton && (
              <TouchableOpacity
                onPress={() => {
                  this.clearTime = true
                  this.props.onClear()
                }}
              >
                <Icon
                  type="MaterialIcons"
                  name="close"
                  style={{
                    paddingLeft: 10,
                    color: sharedColors.borderColor,
                    fontSize: 24,
                    top: '2%',
                  }}
                />
              </TouchableOpacity>
            )}
          </View>
        </TableItem>
        {this.showTimePicker && (
          <DateTimePicker
            textColor={sharedColors.textColor}
            value={this.props.pickerValue}
            mode={'time'}
            is24Hour={true}
            display="default"
            onChange={(event, date) => {
              if (Platform.OS === 'android') {
                this.showTimePicker = false
              }
              if (event.type === 'set' || Platform.OS === 'ios') {
                this.props.onSet(date || this.props.pickerValue)
              }
            }}
          />
        )}
      </>
    )
  }
}

@observer
export class TodoSettings extends Component {
  componentWillMount() {
    makeObservable(this)
  }

  @computed get dateFromStartTimeOfDay() {
    const date = new Date()
    const startTimeOfDay = sharedSettingsStore.startTimeOfDaySafe
    date.setHours(parseInt(startTimeOfDay.substr(0, 2)))
    date.setMinutes(parseInt(startTimeOfDay.substr(3)))
    return date
  }

  @computed get dateFromPlanningReminderTime() {
    const date = new Date()
    const startTimeOfDay = sharedSettingsStore.planningReminderTime || '00:00'
    date.setHours(parseInt(startTimeOfDay.substr(0, 2)))
    date.setMinutes(parseInt(startTimeOfDay.substr(3)))
    return date
  }

  timeStingFromDate(fallback: string, date?: Date) {
    return date
      ? `${('0' + date.getHours()).slice(-2)}:${('0' + date.getMinutes()).slice(
          -2
        )}`
      : fallback
  }

  startReminders(date: Date) {
    sharedSettingsStore.planningReminderTime = this.timeStingFromDate(
      '00:00',
      date
    )
    scheduleReminders(sharedSettingsStore.planningReminderTime)
  }

  stopReminders() {
    sharedSettingsStore.planningReminderTime = undefined
    stopReminders()
  }

  render() {
    return (
      <>
        <TextAndSwitch
          title="defaultToToday"
          value={sharedSettingsStore.showTodayOnAddTodo}
          onValueChange={(value) => {
            sharedSettingsStore.showTodayOnAddTodo = value
            sharedSettingsStore.updatedAt = new Date()
            sockets.settingsSyncManager.sync()
          }}
        />
        <TextAndSwitch
          title="newTodosGoOnTop"
          value={sharedSettingsStore.newTodosGoFirst}
          onValueChange={(value) => {
            sharedSettingsStore.newTodosGoFirst = value
            sharedSettingsStore.updatedAt = new Date()
            sockets.settingsSyncManager.sync()
          }}
        />
        <TextAndSwitch
          title="preserveOrderByTime"
          value={sharedSettingsStore.preserveOrderByTime}
          onValueChange={(value) => {
            sharedSettingsStore.preserveOrderByTime = value
            sharedSettingsStore.updatedAt = new Date()
            sockets.settingsSyncManager.sync()
          }}
        />
        <TextAndSwitch
          title="askBeforeDelete"
          value={sharedSettingsStore.askBeforeDelete}
          onValueChange={(value) => {
            sharedSettingsStore.askBeforeDelete = value
            sharedSettingsStore.updatedAt = new Date()
            sockets.settingsSyncManager.sync()
          }}
        />
        <TextAndSwitch
          title="settingsObject.duplicateTagInBreakdown"
          value={sharedSettingsStore.duplicateTagInBreakdown}
          onValueChange={(value) => {
            sharedSettingsStore.duplicateTagInBreakdown = value
            sharedSettingsStore.updatedAt = new Date()
            sockets.settingsSyncManager.sync()
          }}
        />
        <TextAndSwitch
          title="settingsObject.showMoreByDefault"
          value={sharedSettingsStore.showMoreByDefault}
          onValueChange={(value) => {
            sharedSettingsStore.showMoreByDefault = value
            sharedSettingsStore.updatedAt = new Date()
            sockets.settingsSyncManager.sync()
          }}
        />
        <TableItem
          onPress={() => {
            ActionSheet.show(
              {
                options: [0, 1, 2, 3, 4, 5, 6]
                  .map((v) => translate(`weekday${v}`))
                  .concat([translate('cancel')]),
                cancelButtonIndex: 7,
                destructiveButtonIndex: 7,
                title: '',
              },
              (i) => {
                if (i < 7) {
                  sharedSettingsStore.firstDayOfWeek = i
                  sharedSettingsStore.updatedAt = new Date()
                  sockets.settingsSyncManager.sync()
                }
              }
            )
          }}
        >
          <Text
            style={{ flex: 1, ...sharedColors.regularTextExtraStyle.style }}
          >
            {translate('firstDayOfWeek')}
          </Text>
          <Text {...sharedColors.textExtraStyle}>
            {translate(`weekday${sharedSettingsStore.firstDayOfWeekSafe}`)}
          </Text>
        </TableItem>
        <TimePickerRow
          title="startTimeOfDay"
          showClearButton={sharedSettingsStore.startTimeOfDaySafe != '00:00'}
          onClear={() => {
            sharedSettingsStore.startTimeOfDay = '00:00'
            sharedSettingsStore.updatedAt = new Date()
            sockets.settingsSyncManager.sync()
          }}
          value={sharedSettingsStore.startTimeOfDaySafe}
          pickerValue={this.dateFromStartTimeOfDay}
          onSet={(date) => {
            sharedSettingsStore.startTimeOfDay = this.timeStingFromDate(
              sharedSettingsStore.startTimeOfDaySafe,
              date
            )
            sharedSettingsStore.updatedAt = new Date()
            sockets.settingsSyncManager.sync()
          }}
        />
        <TimePickerRow
          title="planningReminderTime"
          showClearButton={!!sharedSettingsStore.planningReminderTime}
          onClear={() => {
            sharedSettingsStore.planningReminderTime = undefined
            stopReminders()
          }}
          value={
            sharedSettingsStore.planningReminderTime || translate('notSet')
          }
          pickerValue={this.dateFromPlanningReminderTime}
          onSet={async (date) => {
            const permissions = await getNotificationPermissions()
            if (!permissions.alert && Platform.OS === 'ios') {
              try {
                const gotPermissions = await PushNotification.requestPermissions(
                  ['alert']
                )
                if (gotPermissions.alert) {
                  this.startReminders(date)
                } else {
                  this.stopReminders()
                }
              } catch (err) {
                this.stopReminders()
              }
            } else {
              this.startReminders(date)
            }
          }}
        />
        <TableItem
          onPress={() => {
            navigate('Tags')
          }}
        >
          <Text
            style={{ flex: 1, ...sharedColors.regularTextExtraStyle.style }}
          >
            {translate('tags')}
          </Text>
        </TableItem>
      </>
    )
  }
}
