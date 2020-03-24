import React, { Component } from 'react'
import { Container, Content, Text, Button, Spinner } from 'native-base'
import { sharedSessionStore } from '@stores/SessionStore'
import { SubscriptionStatus } from '@models/User'
import { observer } from 'mobx-react'
import { observable } from 'mobx'
import { Subscription } from 'react-native-iap'
import {
  getProducts,
  purchase,
  purchaseListener,
  restorePurchases,
} from '@utils/purchases'
import { alertError, alertMessage } from '@utils/alert'
import { sockets } from '@utils/sockets'
import { translate } from '@utils/i18n'
import { sharedColors } from '@utils/sharedColors'
import RNRestart from 'react-native-restart'
import { Platform } from 'react-native'
import { navigate } from '@utils/navigation'

class PaywallVM {
  @observable products: Subscription[] = []

  @observable loading = false
}

@observer
export class Paywall extends Component {
  vm = new PaywallVM()

  async componentDidMount() {
    purchaseListener.fail = err => {
      alertError(err.message || translate('purchaseError'))
    }
    purchaseListener.success = () => {
      sockets.globalSync()
      alertMessage(
        translate('purchaseThankYou'),
        translate('purchaseThankYouText'),
        () => {
          RNRestart.Restart()
        }
      )
    }

    this.vm.loading = true
    try {
      this.vm.products = await getProducts()
    } catch (err) {
      alertError(err)
    } finally {
      this.vm.loading = false
    }
  }

  render() {
    return (
      <Container>
        <Content
          style={{ padding: 16, backgroundColor: sharedColors.backgroundColor }}
        >
          {sharedSessionStore.user?.subscriptionStatus ===
            SubscriptionStatus.active && (
            <Text {...sharedColors.textExtraStyle}>
              {translate('activeText')}
            </Text>
          )}
          {(sharedSessionStore.user?.subscriptionStatus ===
            SubscriptionStatus.inactive ||
            (sharedSessionStore.user?.subscriptionStatus ===
              SubscriptionStatus.trial &&
              sharedSessionStore.isTrialOver)) && (
            <Text {...sharedColors.textExtraStyle}>
              {translate('endTrialText')}
            </Text>
          )}
          {sharedSessionStore.user?.subscriptionStatus ===
            SubscriptionStatus.earlyAdopter && (
            <Text {...sharedColors.textExtraStyle}>
              <Text {...sharedColors.textExtraStyle}>
                {translate('earlyAdopterText')}
              </Text>
              {sharedSessionStore.hasPurchased && (
                <Text {...sharedColors.textExtraStyle}>
                  {translate('earlyAdopterTextBonus')}
                </Text>
              )}
            </Text>
          )}
          {sharedSessionStore.user?.subscriptionStatus ===
            SubscriptionStatus.trial &&
            !sharedSessionStore.isTrialOver && (
              <Text {...sharedColors.textExtraStyle}>
                {translate('trialText')}
              </Text>
            )}
          <Text
            style={{
              flex: 1,
              paddingVertical: 16,
              textAlign: 'right',
              ...sharedColors.textExtraStyle.style,
            }}
          >
            {translate('signature')}
          </Text>
          {(this.vm.loading || purchaseListener.isPurchasing) && <Spinner />}
          {!sharedSessionStore.hasPurchased && (
            <>
              {this.vm.products.map((product, i) => (
                <Button
                  style={{
                    justifyContent: 'center',
                    flexDirection: 'column',
                    marginTop: 16,
                  }}
                  onPress={() => {
                    purchase(product.productId)
                  }}
                  disabled={purchaseListener.isPurchasing}
                  key={i}
                >
                  <Text>
                    {Platform.OS === 'android'
                      ? product.title.toLowerCase().replace(' (todorant x)', '')
                      : product.title}
                  </Text>
                  <Text>
                    {product.localizedPrice}/
                    {product.productId ===
                    (Platform.OS === 'android' ? 'todorant.monthly' : 'monthly')
                      ? 'month'
                      : Platform.OS === 'android'
                      ? 'year (16.6% discount)'
                      : 'year (~15% discount)'}
                  </Text>
                </Button>
              ))}
              <Button
                style={{
                  justifyContent: 'center',
                  marginTop: 8,
                }}
                small
                transparent
                onPress={() => {
                  navigate('Terms')
                }}
              >
                <Text style={{ color: sharedColors.placeholderColor }}>
                  {translate('termsOfUse')}
                </Text>
              </Button>
              <Button
                style={{
                  justifyContent: 'center',
                }}
                small
                transparent
                onPress={() => {
                  navigate('Privacy')
                }}
              >
                <Text style={{ color: sharedColors.placeholderColor }}>
                  {translate('privacyPolicy')}
                </Text>
              </Button>
            </>
          )}
          <Button
            style={{
              justifyContent: 'center',
              flexDirection: 'column',
              marginTop: 16,
            }}
            transparent
            onPress={() => {
              restorePurchases()
            }}
            disabled={purchaseListener.isPurchasing}
          >
            <Text {...sharedColors.textExtraStyle}>
              {translate('restorePurchases')}
            </Text>
          </Button>
        </Content>
      </Container>
    )
  }
}