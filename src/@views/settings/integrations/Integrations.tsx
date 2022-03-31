import * as rest from '@utils/rest'
import { ActionSheet, Container, Content, Text } from 'native-base'
import { Platform } from 'react-native'
import { Spinner } from '@components/Spinner'
import { SyncRequestEvent } from '@sync/SyncRequestEvent'
import { TableItem } from '@components/TableItem'
import { alertConfirm, alertError, alertMessage } from '@utils/alert'
import { makeObservable, observable } from 'mobx'
import { navigate } from '@utils/navigation'
import { observer } from 'mobx-react'
import { removeToken, setToken } from '@utils/keychain'
import { sharedColors } from '@utils/sharedColors'
import { sharedSessionStore } from '@stores/SessionStore'
import { sharedSettingsStore } from '@stores/SettingsStore'
import { sharedSync } from '@sync/Sync'
import { translate } from '@utils/i18n'
import React, { Component } from 'react'

@observer
export class Integrations extends Component {
  @observable loading = false

  UNSAFE_componentWillMount() {
    makeObservable(this)
  }

  async googleCalendarTapped() {
    if (!sharedSessionStore.user?.token) {
      return
    }
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
            sharedSync.sync(SyncRequestEvent.Settings)
          }
        }
      )
    } else {
      this.loading = true
      try {
        const url = (
          await rest.calendarAuthenticationURL(sharedSessionStore.user?.token)
        ).data
        navigate('GoogleCalendar', {
          url,
          authorize: this.authorizeGoogleCalendar,
        })
      } catch (err) {
        alertError(err as string)
      } finally {
        this.loading = false
      }
    }
  }

  authorizeGoogleCalendar = async (code: string) => {
    if (!sharedSessionStore.user?.token) {
      return
    }
    this.loading = true
    try {
      const googleCredentials = (
        await rest.calendarAuthorize(code, sharedSessionStore.user?.token)
      ).data
      sharedSettingsStore.googleCalendarCredentials = googleCredentials
      sharedSettingsStore.updatedAt = new Date()
      sharedSync.sync(SyncRequestEvent.Settings)
    } catch (err) {
      alertError(err as string)
    } finally {
      this.loading = false
    }
  }

  sendAppleWatchToken() {
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
              alertConfirm(
                translate('googleCalendarHint'),
                translate('googleCalendarGotIt'),
                () => this.googleCalendarTapped()
              )
            }}
          >
            <Text {...sharedColors.textExtraStyle}>
              {translate('googleCalendar')}
            </Text>
            {this.loading ? (
              <Spinner noPadding maxHeight={25} />
            ) : (
              <Text {...sharedColors.textExtraStyle}>
                {translate(
                  sharedSettingsStore.googleCalendarCredentials
                    ? 'connected'
                    : 'notConnected'
                )}
              </Text>
            )}
          </TableItem>

          {Platform.OS === 'ios' && (
            <TableItem
              {...sharedColors.listItemExtraStyle}
              onPress={() => {
                this.sendAppleWatchToken()
              }}
            >
              <Text {...sharedColors.textExtraStyle}>Connect Apple Watch</Text>
            </TableItem>
          )}
        </Content>
      </Container>
    )
  }
}
