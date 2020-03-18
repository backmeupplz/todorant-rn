import React, { Component } from 'react'
import { Button, Text, ListItem, View } from 'native-base'
import { observer } from 'mobx-react'
import { navigate } from '@utils/navigation'
import { sharedSessionStore } from '@stores/SessionStore'
import { subscriptionStatusName, SubscriptionStatus } from '@models/User'

@observer
export class SubscriptionSection extends Component {
  render() {
    return (
      <>
        <ListItem
          style={{ justifyContent: 'space-between' }}
          onPress={() => {
            navigate('Paywall')
          }}
        >
          <Text>Subscription</Text>
          <View style={{ alignItems: 'flex-end' }}>
            <Text>
              {subscriptionStatusName(
                sharedSessionStore.user?.subscriptionStatus
              )}
            </Text>
            {sharedSessionStore.user?.subscriptionStatus ===
              SubscriptionStatus.trial &&
              !sharedSessionStore.user?.isTrialOver && (
                <Text style={{ color: 'grey', fontSize: 12 }}>
                  Days left: {sharedSessionStore.user?.daysLeftOfTrial}
                </Text>
              )}
          </View>
        </ListItem>
        {sharedSessionStore.user?.token &&
          (!sharedSessionStore.user?.isSubscriptionActive ||
            sharedSessionStore.user.subscriptionStatus ===
              SubscriptionStatus.trial) && (
            <ListItem>
              <Button
                danger
                style={{ flex: 1 }}
                block
                onPress={() => {
                  navigate('Paywall')
                }}
              >
                <Text>Buy subscription</Text>
              </Button>
            </ListItem>
          )}
      </>
    )
  }
}
