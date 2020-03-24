import React, { Component } from 'react'
import { Button, Text, ListItem, View } from 'native-base'
import { observer } from 'mobx-react'
import { navigate } from '@utils/navigation'
import { sharedSessionStore } from '@stores/SessionStore'
import { SubscriptionStatus } from '@models/User'
import { translate } from '@utils/i18n'
import { sharedColors } from '@utils/sharedColors'
import { subscriptionStatusName } from '@views/current/Current'

@observer
export class SubscriptionSection extends Component {
  render() {
    return (
      <>
        <ListItem
          style={{
            justifyContent: 'space-between',
            borderColor: sharedColors.placeholderColor,
          }}
          onPress={() => {
            navigate('Paywall')
          }}
        >
          <Text {...sharedColors.textExtraStyle}>
            {translate('subscription')}
          </Text>
          <View style={{ alignItems: 'flex-end' }}>
            <Text {...sharedColors.textExtraStyle}>
              {subscriptionStatusName(
                sharedSessionStore.user?.subscriptionStatus
              )()}
            </Text>
            {sharedSessionStore.user?.subscriptionStatus ===
              SubscriptionStatus.trial &&
              !sharedSessionStore.isTrialOver && (
                <Text
                  style={{ color: sharedColors.placeholderColor, fontSize: 12 }}
                >
                  {translate('daysLeft')}
                  {sharedSessionStore.daysLeftOfTrial}
                </Text>
              )}
          </View>
        </ListItem>
        {sharedSessionStore.user?.token &&
          (!sharedSessionStore.isSubscriptionActive ||
            sharedSessionStore.user.subscriptionStatus ===
              SubscriptionStatus.trial) && (
            <ListItem style={{ borderColor: sharedColors.placeholderColor }}>
              <Button
                danger
                style={{ flex: 1 }}
                block
                onPress={() => {
                  navigate('Paywall')
                }}
              >
                <Text>{translate('buySubscription')}</Text>
              </Button>
            </ListItem>
          )}
      </>
    )
  }
}
