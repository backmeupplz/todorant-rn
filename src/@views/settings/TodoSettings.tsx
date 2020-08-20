import React, { Component } from 'react'
import { Text, ActionSheet, View, Icon } from 'native-base'
import { sharedSettingsStore } from '@stores/SettingsStore'
import { sockets } from '@utils/sockets'
import { observer } from 'mobx-react'
import { Switch, TouchableOpacity } from 'react-native-gesture-handler'
import { translate } from '@utils/i18n'
import { sharedColors } from '@utils/sharedColors'
import { navigate } from '@utils/navigation'
import { TableItem } from '@components/TableItem'
import { Platform } from 'react-native'
import DateTimePicker from '@react-native-community/datetimepicker'
import { observable, computed } from 'mobx'

@observer
export class TodoSettings extends Component {
  @observable showTimePicker = false
  @observable clearTime = false
  @observable selectedDate?: Date

  @computed get dateFromTime() {
    const date = new Date()
    const startTimeOfDay = sharedSettingsStore.startTimeOfDaySafe
    date.setHours(parseInt(startTimeOfDay.substr(0, 2)))
    date.setMinutes(parseInt(startTimeOfDay.substr(3)))
    return date
  }

  @computed get timeString() {
    return this.selectedDate
      ? `${('0' + this.selectedDate?.getHours()).slice(-2)}:${(
          '0' + this.selectedDate?.getMinutes()
        ).slice(-2)}`
      : sharedSettingsStore.startTimeOfDaySafe
  }

  render() {
    return (
      <>
        <TableItem>
          <Text
            style={{
              flex: 1,
              paddingRight: 10,
              ...sharedColors.regularTextExtraStyle.style,
            }}
          >
            {translate('defaultToToday')}
          </Text>
          <Switch
            value={sharedSettingsStore.showTodayOnAddTodo}
            onValueChange={(value) => {
              sharedSettingsStore.showTodayOnAddTodo = value
              sharedSettingsStore.updatedAt = new Date()
              sockets.settingsSyncManager.sync()
            }}
            thumbColor={Platform.OS === 'android' ? 'lightgrey' : undefined}
            trackColor={{ false: 'grey', true: sharedColors.primaryColor }}
          />
        </TableItem>
        <TableItem>
          <Text
            style={{
              flex: 1,
              paddingRight: 10,
              ...sharedColors.regularTextExtraStyle.style,
            }}
          >
            {translate('newTodosGoOnTop')}
          </Text>
          <Switch
            value={sharedSettingsStore.newTodosGoFirst}
            onValueChange={(value) => {
              sharedSettingsStore.newTodosGoFirst = value
              sharedSettingsStore.updatedAt = new Date()
              sockets.settingsSyncManager.sync()
            }}
            thumbColor={Platform.OS === 'android' ? 'lightgrey' : undefined}
            trackColor={{ false: 'grey', true: sharedColors.primaryColor }}
          />
        </TableItem>
        <TableItem>
          <Text
            style={{
              flex: 1,
              paddingRight: 10,
              ...sharedColors.regularTextExtraStyle.style,
            }}
          >
            {translate('preserveOrderByTime')}
          </Text>
          <Switch
            value={sharedSettingsStore.preserveOrderByTime}
            onValueChange={(value) => {
              sharedSettingsStore.preserveOrderByTime = value
              sharedSettingsStore.updatedAt = new Date()
              sockets.settingsSyncManager.sync()
            }}
            thumbColor={Platform.OS === 'android' ? 'lightgrey' : undefined}
            trackColor={{ false: 'grey', true: sharedColors.primaryColor }}
          />
        </TableItem>
        <TableItem>
          <Text
            style={{
              flex: 1,
              paddingRight: 10,
              ...sharedColors.regularTextExtraStyle.style,
            }}
          >
            {translate('askBeforeDelete')}
          </Text>
          <Switch
            value={sharedSettingsStore.askBeforeDelete}
            onValueChange={(value) => {
              sharedSettingsStore.askBeforeDelete = value
            }}
            thumbColor={Platform.OS === 'android' ? 'lightgrey' : undefined}
            trackColor={{ false: 'grey', true: sharedColors.primaryColor }}
          />
        </TableItem>
        <TableItem>
          <Text
            style={{
              flex: 1,
              paddingRight: 10,
              ...sharedColors.regularTextExtraStyle.style,
            }}
          >
            {translate('settingsObject.duplicateTagInBreakdown')}
          </Text>
          <Switch
            value={sharedSettingsStore.duplicateTagInBreakdown}
            onValueChange={(value) => {
              sharedSettingsStore.duplicateTagInBreakdown = value
              sharedSettingsStore.updatedAt = new Date()
              sockets.settingsSyncManager.sync()
            }}
            thumbColor={Platform.OS === 'android' ? 'lightgrey' : undefined}
            trackColor={{ false: 'grey', true: sharedColors.primaryColor }}
          />
        </TableItem>
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
        <TableItem
          onPress={() => {
            if (!this.clearTime) {
              this.showTimePicker = !this.showTimePicker
            }
            this.clearTime = false
          }}
        >
          {this.showTimePicker && (
            <DateTimePicker
              textColor={sharedColors.textColor}
              value={this.dateFromTime}
              mode={'time'}
              is24Hour={true}
              display="default"
              onChange={(event, date) => {
                if (Platform.OS === 'android') {
                  this.showTimePicker = false
                }
                if (event.type === 'set' || Platform.OS === 'ios') {
                  this.selectedDate = date || this.dateFromTime
                  sharedSettingsStore.startTimeOfDay = this.timeString
                  sharedSettingsStore.updatedAt = new Date()
                  sockets.settingsSyncManager.sync()
                }
              }}
            />
          )}
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
              {translate('startTimeOfDay')}
            </Text>
            <Text {...sharedColors.textExtraStyle}>
              {sharedSettingsStore.startTimeOfDaySafe}
            </Text>

            {sharedSettingsStore.startTimeOfDaySafe != '00:00' && (
              <TouchableOpacity
                onPress={() => {
                  this.clearTime = true
                  sharedSettingsStore.startTimeOfDay = '00:00'
                  sharedSettingsStore.updatedAt = new Date()
                  sockets.settingsSyncManager.sync()
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
