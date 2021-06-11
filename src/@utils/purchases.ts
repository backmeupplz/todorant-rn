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
      : ['monthly', 'yearly', 'perpetual']
  return [
    ...(await RNIap.getSubscriptions(skus || produtctsAndSubscriptions)),
    ...(await RNIap.getProducts(skus || produtctsAndSubscriptions)),
  ]
}

async function tryPurchase(
  purchase?: SubscriptionPurchase,
  appleReceipt?: string
) {
  purchaseListener.isPurchasing = true
  try {
    const receipt = appleReceipt || purchase?.transactionReceipt

    if (receipt) {
      if (Platform.OS === 'android' && purchase?.purchaseToken) {
        await rest.verifyPurchaseGoogle({
          packageName: 'com.todorant',
          productId: purchase.productId,
          purchaseToken: purchase.purchaseToken,
        })
      } else {
        if (sharedSessionStore.user) {
          if (Platform.OS === 'ios') {
            await delay(5)
          }
          await rest.verifyPurchaseApple(receipt)
        } else {
          sharedSessionStore.localAppleReceipt = receipt
        }
      }
      try {
        if (purchase) {
          await RNIap.finishTransaction(purchase, false)
        }
      } catch (err) {
        if (!err.message.includes('purchase is not suitable to be purchased')) {
          throw err
        }
      }
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

function delay(s: number) {
  return new Promise<void>((res) => {
    setTimeout(() => {
      res()
    }, s * 1000)
  })
}

export const purchaseUpdateSubscription = purchaseUpdatedListener(tryPurchase)

export const purchaseErrorSubscription = purchaseErrorListener(
  (error: PurchaseError) => {
    console.log(`Purchase error: ${error}`)
    logEvent('subscription_purchase_error_local')
    if (purchaseListener.fail) {
      purchaseListener.fail(error)
    }
  }
)

export async function purchase(sku: string) {
  purchaseListener.isPurchasing = true
  try {
    if (sku.includes('perpetual')) {
      await RNIap.requestPurchase(sku, false)
    } else {
      await RNIap.requestSubscription(sku, false)
    }
  } finally {
    purchaseListener.isPurchasing = false
  }
}

export async function restorePurchases() {
  console.log('restoring purchases')
  purchaseListener.isPurchasing = true
  try {
    if (Platform.OS === 'android') {
      const purchases = await RNIap.getPurchaseHistory()
      console.log('Got restored purchases:', purchases)
      for (const purchase of purchases) {
        tryPurchase(purchase)
      }
      if (!purchases.length) {
        alertError(translate('noPurchasesError'))
      }
    } else {
      const receipt = await RNIap.getReceiptIOS()
      console.log('Got restored receipt:', receipt)
      if (!receipt) {
        alertError(translate('noPurchasesError'))
      } else {
        tryPurchase(undefined, receipt)
      }
    }
  } catch (err) {
    if (purchaseListener.fail) {
      purchaseListener.fail(err)
    }
  } finally {
    purchaseListener.isPurchasing = false
  }
}
