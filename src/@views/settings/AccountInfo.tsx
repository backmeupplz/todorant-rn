import React, { Component } from 'react'
import { Text, Toast } from 'native-base'
import { observer } from 'mobx-react'
import { sharedSessionStore } from '@stores/SessionStore'
import { SubscriptionSection } from '@views/settings/SubscriptionSection'
import { translate } from '@utils/i18n'
import { sharedColors } from '@utils/sharedColors'
import { Clipboard } from 'react-native'
import { SectionHeader } from '@components/SectionHeader'
import { TableItem } from '@components/TableItem'

@observer
class InfoRow extends Component<{ title: string; value: string }> {
  render() {
    return (
      <TableItem
        {...sharedColors.listItemExtraStyle}
        onPress={() => {
          Clipboard.setString(this.props.value)
          Toast.show({ text: `"${this.props.value}" ${translate('copied')}` })
        }}
      >
        <Text {...sharedColors.regularTextExtraStyle}>{this.props.title}</Text>
        <Text
          style={{
            ...sharedColors.regularTextExtraStyle.style,
            flexWrap: 'wrap',
          }}
        >
          {this.props.value.length <= 30
            ? this.props.value
            : `${this.props.value.substr(0, 30)}...`}
        </Text>
      </TableItem>
    )
  }
}

@observer
export class AccountInfo extends Component {
  render() {
    return !sharedSessionStore.user ? (
      <>
        <SectionHeader title={translate('account')} />
        <TableItem>
          <Text {...sharedColors.regularTextExtraStyle}>
            {translate('anonymousText')}
          </Text>
        </TableItem>
      </>
    ) : (
      <>
        <SectionHeader title={translate('account')} />
        <InfoRow
          title={translate('nameLabel')}
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
