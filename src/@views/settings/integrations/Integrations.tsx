import React, { Component } from 'react'
import { Platform } from 'react-native'
import { sharedColors } from '@utils/sharedColors'
import { Container, Text, ActionSheet, Content } from 'native-base'
import { observer } from 'mobx-react'
import { translate } from '@utils/i18n'
import { sharedSettingsStore } from '@stores/SettingsStore'
import { sharedSessionStore } from '@stores/SessionStore'
import { navigate } from '@utils/navigation'
import { sockets } from '@utils/sockets'
import { observable } from 'mobx'
import { alertError, alertMessage } from '@utils/alert'
import * as rest from '@utils/rest'
import { Spinner } from '@components/Spinner'
import { TableItem } from '@components/TableItem'
import { setToken, removeToken } from '@utils/keychain'

function sendAppleWatchToken() {
  const token = sharedSessionStore.user?.token
  if (token) {
    setToken(token)
  } else {
    removeToken()
  }
  alertMessage(
    'Success!',
    'If Apple Watch is paired to this device, Todorant app on it should be working now. You might need to restart the Apple Watch Todorant app for this to work well.'
  )
}

function ConnectAppleWatchTableItem() {
  if (Platform.OS === 'ios') {
    return (
      <TableItem
        {...sharedColors.listItemExtraStyle}
        onPress={() => {
          sendAppleWatchToken()
        }}
      >
        <Text {...sharedColors.textExtraStyle}>Connect Apple Watch</Text>
      </TableItem>
    )
  }
}

@observer
export class Integrations extends Component {
  @observable googleCalendarLoading = false

  async googleCalendarTapped() {
    if (sharedSettingsStore.googleCalendarCredentials) {
      ActionSheet.show(
        {
          options: [translate('disconnect'), translate('cancel')],
          cancelButtonIndex: 1,
          destructiveButtonIndex: 0,
          title: '',
        },
        async (i) => {
          if (i === 0) {
            sharedSettingsStore.googleCalendarCredentials = undefined
            sharedSettingsStore.updatedAt = new Date()
            sockets.settingsSyncManager.sync()
          }
        }
      )
    } else {
      this.googleCalendarLoading = true
      try {
        const url = (await rest.calendarAuthenticationURL()).data
        navigate('GoogleCalendar', {
          url,
          authorize: this.authorizeGoogleCalendar,
        })
      } catch (err) {
        alertError(err)
      } finally {
        this.googleCalendarLoading = false
      }
    }
  }

  authorizeGoogleCalendar = async (code: string) => {
    this.googleCalendarLoading = true
    try {
      const googleCredentials = (await rest.calendarAuthorize(code)).data
      sharedSettingsStore.googleCalendarCredentials = googleCredentials
      sharedSettingsStore.updatedAt = new Date()
      sockets.settingsSyncManager.sync()
    } catch (err) {
      alertError(err)
    } finally {
      this.googleCalendarLoading = false
    }
  }

  render() {
    return (
      <Container
        style={{
          backgroundColor: sharedColors.backgroundColor,
          paddingTop: 16,
        }}
      >
        <Content>
          <TableItem
            {...sharedColors.listItemExtraStyle}
            onPress={() => {
              this.googleCalendarTapped()
            }}
          >
            <Text {...sharedColors.textExtraStyle}>
              {translate('googleCalendar')}
            </Text>
            {this.googleCalendarLoading ? (
              <Spinner noPadding maxHeight={25} />
            ) : (
              <Text {...sharedColors.textExtraStyle}>
                {translate(
                  !!sharedSettingsStore.googleCalendarCredentials
                    ? 'connected'
                    : 'notConnected'
                )}
              </Text>
            )}
          </TableItem>

          {ConnectAppleWatchTableItem()}
        </Content>
      </Container>
    )
  }
}
