import { Button } from '@components/Button'
import { Divider } from '@components/Divider'
import { Spinner } from '@components/Spinner'
import { TableItem } from '@components/TableItem'
import { SubscriptionStatus } from '@models/User'
import { RouteProp, useRoute } from '@react-navigation/native'
import { sharedSessionStore } from '@stores/SessionStore'
import { sharedSettingsStore } from '@stores/SettingsStore'
import { sharedSync } from '@sync/Sync'
import { SyncRequestEvent } from '@sync/SyncRequestEvent'
import { alertError, alertMessage } from '@utils/alert'
import { translate } from '@utils/i18n'
import { logEvent } from '@utils/logEvent'
import { navigate } from '@utils/navigation'
import {
  getProducts,
  purchase,
  purchaseListener,
  restorePurchases,
} from '@utils/purchases'
import { sharedColors } from '@utils/sharedColors'
import { makeObservable, observable } from 'mobx'
import { observer } from 'mobx-react'
import { Container, Content, Text, View } from 'native-base'
import React, { Component } from 'react'
import { Linking, Platform } from 'react-native'
import RNRestart from 'react-native-restart'
import { uniqBy } from 'lodash'

class PaywallVM {
  @observable products: [] = []

  @observable loading = false

  constructor() {
    makeObservable(this)
  }
}

@observer
class PaywallContent extends Component<{
  route: RouteProp<
    Record<string, { type: string | undefined } | undefined>,
    string
  >
}> {
  vm = new PaywallVM()

  async componentDidMount() {
    logEvent('subscription_viewed')
    purchaseListener.fail = (err) => {
      alertError(
        (Platform.OS === 'ios' ? err.message : undefined) ||
          translate('purchaseError'),
        Platform.OS === 'ios' ? undefined : translate('purchaseErrorTryOnWeb'),
        () => {
          Linking.openURL('https://todorant.com')
        }
      )
    }
    purchaseListener.success = async () => {
      try {
        if (sharedSessionStore.user) {
          await sharedSync.sync(SyncRequestEvent.All)
        }
      } catch (err) {
        alertError(err)
      }
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
      this.vm.products = sortProducts(
        uniqBy(
          await getProducts(
            Platform.OS === 'ios' &&
              this.props.route.params?.type === 'appleUnauthorized'
              ? ['monthly.with.trial', 'yearly.with.trial', 'perpetual']
              : undefined
          ),
          (p) => p.productId
        )
      )
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
          style={{
            backgroundColor: sharedColors.backgroundColor,
          }}
        >
          {this.props.route.params?.type === 'appleUnauthorized' ? (
            <View style={{ marginHorizontal: 16, marginTop: 16 }}>
              <Text {...sharedColors.regularTextExtraStyle}>
                {translate('appleUnauthorizedText')}
              </Text>
              <Text style={{ color: sharedColors.textColor, marginTop: 10 }}>
                {translate('appleUnauthorizedTextGoodNews')}
              </Text>
              <Text
                style={{
                  flex: 1,
                  paddingVertical: 16,
                  textAlign: 'right',
                  ...sharedColors.regularTextExtraStyle.style,
                }}
              >
                {translate('signature')}
              </Text>
            </View>
          ) : (
            <View style={{ marginHorizontal: 16, marginTop: 16 }}>
              {sharedSessionStore.user?.subscriptionStatus ===
                SubscriptionStatus.active && (
                <Text {...sharedColors.regularTextExtraStyle}>
                  {translate('activeText')}
                </Text>
              )}
              {(sharedSessionStore.user?.subscriptionStatus ===
                SubscriptionStatus.inactive ||
                (sharedSessionStore.user?.subscriptionStatus ===
                  SubscriptionStatus.trial &&
                  (sharedSessionStore.isTrialOver ||
                    sharedSessionStore.user?.createdOnApple))) && (
                <Text {...sharedColors.regularTextExtraStyle}>
                  {translate('inactiveText')}
                </Text>
              )}
              {sharedSessionStore.user?.subscriptionStatus ===
                SubscriptionStatus.earlyAdopter && (
                <Text {...sharedColors.regularTextExtraStyle}>
                  <Text {...sharedColors.regularTextExtraStyle}>
                    {translate('earlyAdopterText')}
                  </Text>
                  {sharedSessionStore.hasPurchased && (
                    <Text {...sharedColors.regularTextExtraStyle}>
                      {translate('earlyAdopterTextBonus')}
                    </Text>
                  )}
                </Text>
              )}
              {sharedSessionStore.user?.subscriptionStatus ===
                SubscriptionStatus.trial &&
                !sharedSessionStore.isTrialOver &&
                !sharedSessionStore.user?.createdOnApple && (
                  <Text {...sharedColors.regularTextExtraStyle}>
                    {translate('trialText')}
                  </Text>
                )}
              <Text
                style={{
                  flex: 1,
                  paddingVertical: 16,
                  textAlign: 'right',
                  ...sharedColors.regularTextExtraStyle.style,
                }}
              >
                {translate('signature')}
              </Text>
              {(this.vm.loading || purchaseListener.isPurchasing) && (
                <Spinner />
              )}
            </View>
          )}
          {(sharedSessionStore.shouldShowPaywalSubscription ||
            this.props.route.params?.type === 'appleUnauthorized') && (
            <>
              {this.vm.products.map((product, i) => (
                <Button
                  style={{
                    justifyContent: 'center',
                    flexDirection: 'column',
                    marginVertical: 8,
                    marginHorizontal: 16,
                    borderRadius: 10,
                    height:
                      this.props.route.params?.type === 'appleUnauthorized'
                        ? 75
                        : undefined,
                  }}
                  onPress={() => {
                    if (Platform.OS === 'ios') {
                    }
                    purchase(product.productId)
                  }}
                  disabled={purchaseListener.isPurchasing}
                  key={i}
                  bordered={
                    product.productId.includes('monthly') ||
                    product.productId.includes('perpetual')
                  }
                  light={
                    (product.productId.includes('monthly') ||
                      product.productId.includes('perpetual')) &&
                    sharedSettingsStore.isDark
                  }
                >
                  {this.props.route.params?.type === 'appleUnauthorized' &&
                    product.productId !== 'perpetual' && (
                      <Text>{translate('appleUnauthorizedButtonExtra')}</Text>
                    )}
                  <Text>
                    {Platform.OS === 'android'
                      ? product.title
                          .toLowerCase()
                          .replace(' (todorant x)', '')
                          .replace(' (todorant)', '')
                      : product.title}
                  </Text>
                  <Text>
                    {product.localizedPrice}
                    {product.productId.includes('yearly') &&
                      `/${translate('subscriptionYear')}`}
                    {product.productId.includes('monthly') &&
                      `/${translate('subscriptionMonth')}`}
                  </Text>
                </Button>
              ))}
              <Divider />
              <TableItem
                onPress={() => {
                  navigate('Terms')
                }}
              >
                <Text {...sharedColors.regularTextExtraStyle}>
                  {translate('termsOfUse')}
                </Text>
              </TableItem>
              <TableItem
                onPress={() => {
                  navigate('Privacy')
                }}
              >
                <Text {...sharedColors.regularTextExtraStyle}>
                  {translate('privacyPolicy')}
                </Text>
              </TableItem>
            </>
          )}
          <TableItem
            onPress={() => {
              restorePurchases()
            }}
          >
            <Text {...sharedColors.regularTextExtraStyle}>
              {translate('restorePurchases')}
            </Text>
          </TableItem>
        </Content>
      </Container>
    )
  }
}

export const Paywall = () => {
  const route = useRoute<
    RouteProp<Record<string, { type: string | undefined } | undefined>, string>
  >()
  return <PaywallContent route={route} />
}

const productOrder = ['monthly', 'yearly', 'perpetual']
function sortProducts(products: []) {
  return products.sort((a, b) => {
    const productOrderStringA = productOrder.find((s) =>
      a.productId.includes(s)
    )
    const indexA = productOrderStringA
      ? productOrder.indexOf(productOrderStringA)
      : 0
    const productOrderStringB = productOrder.find((s) =>
      b.productId.includes(s)
    )
    const indexB = productOrderStringB
      ? productOrder.indexOf(productOrderStringB)
      : 1
    return indexA < indexB ? -1 : 1
  })
}
