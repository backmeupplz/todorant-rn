import React, { Component } from 'react'
import { Container, Content, Text, Button, Spinner } from 'native-base'
import { sharedSessionStore } from '@stores/SessionStore'
import { SubscriptionStatus } from '@models/User'
import { observer } from 'mobx-react'
import { observable } from 'mobx'
import { Subscription } from 'react-native-iap'
import { getProducts, purchase, purchaseListener } from '@utils/purchases'
import { alertError, alertMessage } from '@utils/alert'
import { goBack } from '@utils/navigation'
import { sockets } from '@utils/sockets'
import { translate } from '@utils/i18n'

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
          goBack()
        }
      )
    }

    this.vm.loading = true
    try {
      this.vm.products = await getProducts()
      console.log(this.vm.products)
    } catch (err) {
      alertError(err)
    } finally {
      this.vm.loading = false
    }
  }

  render() {
    return (
      <Container>
        <Content style={{ padding: 16 }}>
          {sharedSessionStore.user?.subscriptionStatus ===
            SubscriptionStatus.active && <Text>{translate('activeText')}</Text>}
          {(sharedSessionStore.user?.subscriptionStatus ===
            SubscriptionStatus.inactive ||
            (sharedSessionStore.user?.subscriptionStatus ===
              SubscriptionStatus.trial &&
              sharedSessionStore.user?.isTrialOver)) && (
            <Text>{translate('endTrialText')}</Text>
          )}
          {sharedSessionStore.user?.subscriptionStatus ===
            SubscriptionStatus.earlyAdopter && (
            <Text>
              <Text>{translate('earlyAdopterText')}</Text>
              {sharedSessionStore.user?.hasPurchased && (
                <Text>{translate('earlyAdopterTextBonus')}</Text>
              )}
            </Text>
          )}
          {sharedSessionStore.user?.subscriptionStatus ===
            SubscriptionStatus.trial &&
            !sharedSessionStore.user.isTrialOver && (
              <Text>{translate('trialText')}</Text>
            )}
          <Text
            style={{
              flex: 1,
              paddingVertical: 16,
              textAlign: 'right',
            }}
          >
            {translate('signature')}
          </Text>
          {(this.vm.loading || purchaseListener.isPurchasing) && <Spinner />}
          {!sharedSessionStore.user?.hasPurchased &&
            this.vm.products.map((product, i) => (
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
                  {product.title.toLowerCase().replace(' (todorant x)', '')}
                </Text>
                <Text>
                  {product.localizedPrice}/
                  {product.productId === 'monthly699'
                    ? 'month'
                    : 'year (16.6% discount)'}
                </Text>
              </Button>
            ))}
        </Content>
      </Container>
    )
  }
}
