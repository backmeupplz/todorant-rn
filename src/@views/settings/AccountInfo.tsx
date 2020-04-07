import React, { Component } from 'react'
import { ListItem, Text } from 'native-base'
import { observer } from 'mobx-react'
import { sharedSessionStore } from '@stores/SessionStore'
import { SubscriptionSection } from '@views/settings/SubscriptionSection'
import { translate } from '@utils/i18n'
import { sharedColors } from '@utils/sharedColors'

@observer
class InfoRow extends Component<{ title: string; value: string }> {
  render() {
    return (
      <ListItem
        style={{
          justifyContent: 'space-between',
          borderColor: sharedColors.placeholderColor,
        }}
      >
        <Text {...sharedColors.textExtraStyle}>{this.props.title}</Text>
        <Text {...sharedColors.textExtraStyle}>{this.props.value}</Text>
      </ListItem>
    )
  }
}

@observer
export class AccountInfo extends Component {
  render() {
    return !sharedSessionStore.user ? (
      <ListItem style={{ borderColor: sharedColors.placeholderColor }}>
        <Text {...sharedColors.textExtraStyle}>
          {translate('anonymousText')}
        </Text>
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
          {sharedSessionStore.user.appleSubId && (
            <InfoRow
              title={translate('apple')}
              value={sharedSessionStore.user.appleSubId}
            />
          )}
          <SubscriptionSection />
        </>
      )
  }
}
