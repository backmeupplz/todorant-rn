import React, { Component } from 'react'
import { ListItem, Text } from 'native-base'
import { sharedSettingsStore } from '@stores/SettingsStore'
import { sockets } from '@utils/sockets'
import { observer } from 'mobx-react'
import { Switch } from 'react-native-gesture-handler'
import { translate } from '@utils/i18n'
import { sharedColors } from '@utils/sharedColors'

@observer
export class TodoSettings extends Component {
  render() {
    return (
      <>
        <ListItem
          style={{
            justifyContent: 'space-between',
            borderColor: sharedColors.placeholderColor,
          }}
        >
          <Text {...sharedColors.textExtraStyle}>
            {translate('defaultToToday')}
          </Text>
          <Switch
            value={sharedSettingsStore.showTodayOnAddTodo}
            onValueChange={value => {
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
          }}
        >
          <Text {...sharedColors.textExtraStyle}>
            {translate('newTodosGoOnTop')}
          </Text>
          <Switch
            value={sharedSettingsStore.newTodosGoFirst}
            onValueChange={value => {
              sharedSettingsStore.newTodosGoFirst = value
              sharedSettingsStore.updatedAt = new Date()
              sockets.settingsSyncManager.sync()
            }}
          />
        </ListItem>
      </>
    )
  }
}
