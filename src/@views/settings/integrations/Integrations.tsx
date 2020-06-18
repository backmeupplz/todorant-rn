import React, { Component } from 'react'
import { sharedColors } from '@utils/sharedColors'
import {
  ListItem,
  Container,
  List,
  Text,
  ActionSheet,
  Content,
} from 'native-base'
import { observer } from 'mobx-react'
import { translate } from '@utils/i18n'
import { sharedSettingsStore } from '@stores/SettingsStore'
import { navigate } from '@utils/navigation'
import { sockets } from '@utils/sockets'
import { observable } from 'mobx'
import { alertError } from '@utils/alert'
import * as rest from '@utils/rest'
import { Spinner } from '@components/Spinner'
import { TableItem } from '@components/TableItem'

@observer
export class Integrations extends Component {
  @observable loading = false

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
      this.loading = true
      try {
        const url = (await rest.calendarAuthenticationURL()).data
        navigate('GoogleCalendar', {
          url,
          authorize: this.authorizeGoogleCalendar,
        })
      } catch (err) {
        alertError(err)
      } finally {
        this.loading = false
      }
    }
  }

  authorizeGoogleCalendar = async (code: string) => {
    this.loading = true
    try {
      console.log(code)
      const googleCredentials = (await rest.calendarAuthorize(code)).data
      sharedSettingsStore.googleCalendarCredentials = googleCredentials
      sharedSettingsStore.updatedAt = new Date()
      sockets.settingsSyncManager.sync()
    } catch (err) {
      alertError(err)
    } finally {
      this.loading = false
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
            {this.loading ? (
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
        </Content>
      </Container>
    )
  }
}
