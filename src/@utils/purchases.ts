import { logEvent } from '@utils/logEvent'
import { translate } from '@utils/i18n'
import RNIap, {
  purchaseUpdatedListener,
  purchaseErrorListener,
  SubscriptionPurchase,
  PurchaseError,
} from 'react-native-iap'
import { makeObservable, observable } from 'mobx'
import * as rest from '@utils/rest'
import { alertError } from '@utils/alert'
import { Platform } from 'react-native'
import { sharedSessionStore } from '@stores/SessionStore'

class PurchaseListener {
  constructor() {
    makeObservable(this)
  }

  @observable isPurchasing = false

  success?: () => void
  fail?: (err: PurchaseError | Error) => void
}

export const purchaseListener = new PurchaseListener()

export async function getProducts(skus?: string[]) {
  const produtctsAndSubscriptions =
    Platform.OS === 'android'
      ? ['todorant.monthly', 'todorant.yearly.36', 'todorant.perpetual']
      : ['monthly', 'yearly']
  return [
    ...(await RNIap.getSubscriptions(skus || produtctsAndSubscriptions)),
    ...(await RNIap.getProducts(skus || produtctsAndSubscriptions)),
  ]
}

async function tryPurchase(purchase: SubscriptionPurchase) {
  try {
    const receipt = purchase.transactionReceipt

    if (receipt) {
      if (Platform.OS === 'android' && purchase.purchaseToken) {
        await rest.verifyPurchaseGoogle({
          packageName: 'com.todorant',
          productId: purchase.productId,
          purchaseToken: purchase.purchaseToken,
        })
      } else {
        if (sharedSessionStore.user) {
          await rest.verifyPurchaseApple(purchase.transactionReceipt)
        } else {
          sharedSessionStore.localAppleReceipt = purchase.transactionReceipt
        }
      }
      await RNIap.finishTransaction(purchase, false)
    } else {
      throw new Error(translate('purchaseReceiptError'))
    }

    if (purchaseListener.success) {
      purchaseListener.success()
    }
    logEvent('subscription_success')
  } catch (err) {
    logEvent('subscription_purchase_error_server')
    if (purchaseListener.fail) {
      purchaseListener.fail(err)
    }
  } finally {
    purchaseListener.isPurchasing = false
  }
}

export const purchaseUpdateSubscription = purchaseUpdatedListener(tryPurchase)

export const purchaseErrorSubscription = purchaseErrorListener(
  (error: PurchaseError) => {
    logEvent('subscription_purchase_error_local')
    try {
      if (purchaseListener.fail) {
        purchaseListener.fail(error)
      }
    } finally {
      purchaseListener.isPurchasing = false
    }
  }
)

export function purchase(sku: string) {
  purchaseListener.isPurchasing = true
  return RNIap.requestSubscription(sku, false)
}

export async function restorePurchases() {
  purchaseListener.isPurchasing = true
  try {
    const purchases = await RNIap.getAvailablePurchases()
    for (const purchase of purchases) {
      tryPurchase(purchase)
    }
    if (!purchases.length) {
      alertError(translate('noPurchasesError'))
    }
  } catch (err) {
    if (purchaseListener.fail) {
      purchaseListener.fail(err)
    }
  } finally {
    purchaseListener.isPurchasing = false
  }
}
