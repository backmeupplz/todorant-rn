import React, { Component } from 'react'
import { ListItem, Text } from 'native-base'
import { observer } from 'mobx-react'
import { sharedSessionStore } from '@stores/SessionStore'

@observer
class InfoRow extends Component<{ title: string; value: string }> {
  render() {
    return (
      <ListItem style={{ justifyContent: 'space-between' }}>
        <Text>{this.props.title}</Text>
        <Text>{this.props.value}</Text>
      </ListItem>
    )
  }
}

@observer
export class AccountInfo extends Component {
  render() {
    return !sharedSessionStore.user ? (
      <ListItem>
        <Text>
          All your data is stored on your device at the moment. To start
          syncronizing with Todorant servers you need to login.
        </Text>
      </ListItem>
    ) : (
      <>
        <InfoRow title="Name" value={sharedSessionStore.user.name} />
        {sharedSessionStore.user.email && (
          <InfoRow title="Email" value={sharedSessionStore.user.email} />
        )}
        {sharedSessionStore.user.facebookId && (
          <InfoRow
            title="Facebook ID"
            value={sharedSessionStore.user.facebookId}
          />
        )}
        {sharedSessionStore.user.telegramId && (
          <InfoRow
            title="Telegram ID"
            value={sharedSessionStore.user.telegramId}
          />
        )}
      </>
    )
  }
}
