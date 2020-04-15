import React, { Component } from 'react'
import { ListItem, Text, ActionSheet } from 'native-base'
import { sharedSettingsStore } from '@stores/SettingsStore'
import { sockets } from '@utils/sockets'
import { observer } from 'mobx-react'
import { Switch } from 'react-native-gesture-handler'
import { translate } from '@utils/i18n'
import { sharedColors } from '@utils/sharedColors'
import { navigate } from '@utils/navigation'

@observer
export class TodoSettings extends Component {
  render() {
    return (
      <>
        <ListItem
          style={{
            justifyContent: 'space-between',
            borderColor: sharedColors.placeholderColor,
            flex: 1,
          }}
        >
          <Text
            style={{ flex: 1, color: sharedColors.textColor, paddingRight: 10 }}
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
          />
        </ListItem>
        <ListItem
          style={{
            justifyContent: 'space-between',
            borderColor: sharedColors.placeholderColor,
            flex: 1,
          }}
        >
          <Text
            style={{ flex: 1, color: sharedColors.textColor, paddingRight: 10 }}
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
          />
        </ListItem>
        <ListItem
          style={{
            justifyContent: 'space-between',
            borderColor: sharedColors.placeholderColor,
            flex: 1,
          }}
        >
          <Text
            style={{ flex: 1, color: sharedColors.textColor, paddingRight: 10 }}
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
          />
        </ListItem>
        <ListItem
          style={{
            justifyContent: 'space-between',
            borderColor: sharedColors.placeholderColor,
            flex: 1,
          }}
        >
          <Text
            style={{ flex: 1, color: sharedColors.textColor, paddingRight: 10 }}
          >
            {translate('askBeforeDelete')}
          </Text>
          <Switch
            value={sharedSettingsStore.askBeforeDelete}
            onValueChange={(value) => {
              sharedSettingsStore.askBeforeDelete = value
            }}
          />
        </ListItem>
        <ListItem
          style={{
            justifyContent: 'space-between',
            borderColor: sharedColors.placeholderColor,
          }}
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
          <Text style={{ flex: 1, color: sharedColors.textColor }}>
            {translate('firstDayOfWeek')}
          </Text>
          <Text {...sharedColors.textExtraStyle}>
            {translate(`weekday${sharedSettingsStore.firstDayOfWeekSafe}`)}
          </Text>
        </ListItem>
        <ListItem
          style={{
            justifyContent: 'space-between',
            borderColor: sharedColors.placeholderColor,
          }}
          onPress={() => {
            navigate('Tags')
          }}
        >
          <Text style={{ flex: 1, color: sharedColors.textColor }}>
            {translate('tags')}
          </Text>
        </ListItem>
      </>
    )
  }
}
