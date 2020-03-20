import React, { Component } from 'react'
import { ListItem, Text } from 'native-base'
import { observer } from 'mobx-react'
import { sharedSessionStore } from '@stores/SessionStore'
import { SubscriptionSection } from '@views/settings/SubscriptionSection'
import { translate } from '@utils/i18n'

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
        <Text>{translate('anonymousText')}</Text>
      </ListItem>
    ) : (
      <>
        <InfoRow
          title={translate('name')}
          value={sharedSessionStore.user.name}
        />
        {sharedSessionStore.user.email && (
          <InfoRow
            title={translate('email')}
            value={sharedSessionStore.user.email}
          />
        )}
        {sharedSessionStore.user.facebookId && (
          <InfoRow
            title={translate('facebook')}
            value={sharedSessionStore.user.facebookId}
          />
        )}
        {sharedSessionStore.user.telegramId && (
          <InfoRow
            title={translate('telegram')}
            value={sharedSessionStore.user.telegramId}
          />
        )}
        <SubscriptionSection />
      </>
    )
  }
}
