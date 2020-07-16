import React, { Component } from 'react'
import { Text, View } from 'native-base'
import { observer } from 'mobx-react'
import { navigate } from '@utils/navigation'
import { sharedSessionStore } from '@stores/SessionStore'
import { SubscriptionStatus } from '@models/User'
import { translate } from '@utils/i18n'
import { sharedColors } from '@utils/sharedColors'
import { daysAgo } from '@utils/plusButtonAction'
import { subscriptionStatusName } from '@utils/subscriptionStatusName'
import { Button } from '@components/Button'
import { TableItem } from '@components/TableItem'
import fonts from '@utils/fonts'

@observer
export class SubscriptionSection extends Component {
  render() {
    return (
      <>
        <TableItem
          onPress={() => {
            navigate(
              'Paywall',
              sharedSessionStore.user?.createdOnApple &&
                sharedSessionStore.user.createdAt >= daysAgo(14) &&
                !sharedSessionStore.isSubscriptionActive
                ? { type: 'appleUnauthorized' }
                : undefined
            )
          }}
        >
          <Text
            style={{
              color: sharedColors.textColor,
              fontFamily: fonts.SFProTextRegular,
            }}
          >
            {translate('subscription')}
          </Text>
          <View style={{ alignItems: 'flex-end' }}>
            <Text
              style={{
                color: sharedColors.textColor,
                fontFamily: fonts.SFProTextRegular,
              }}
            >
              {subscriptionStatusName(
                sharedSessionStore.user?.subscriptionStatus
              )()}
            </Text>
            {sharedSessionStore.user?.subscriptionStatus ===
              SubscriptionStatus.trial &&
              !sharedSessionStore.user.createdOnApple &&
              !sharedSessionStore.isTrialOver && (
                <Text
                  style={{ color: sharedColors.placeholderColor, fontSize: 12 }}
                >
                  {translate('daysLeft')}
                  {sharedSessionStore.daysLeftOfTrial}
                </Text>
              )}
          </View>
        </TableItem>
        {sharedSessionStore.user?.token &&
          (!sharedSessionStore.isSubscriptionActive ||
            sharedSessionStore.user.subscriptionStatus ===
              SubscriptionStatus.trial) && (
            <TableItem>
              <Button
                danger
                style={{ flex: 1, borderRadius: 10 }}
                block
                onPress={() => {
                  navigate(
                    'Paywall',
                    sharedSessionStore.user?.createdOnApple &&
                      sharedSessionStore.user.createdAt >= daysAgo(14)
                      ? { type: 'appleUnauthorized' }
                      : undefined
                  )
                }}
              >
                <Text>{translate('buySubscription')}</Text>
              </Button>
            </TableItem>
          )}
      </>
    )
  }
}
