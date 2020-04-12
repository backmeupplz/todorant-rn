import { translate } from '@utils/i18n'
import RNIap, {
  purchaseUpdatedListener,
  purchaseErrorListener,
  SubscriptionPurchase,
  PurchaseError,
} from 'react-native-iap'
import { observable } from 'mobx'
import * as rest from '@utils/rest'
import { alertError } from '@utils/alert'
import { Platform } from 'react-native'
import { sharedSessionStore } from '@stores/SessionStore'

class PurchaseListener {
  @observable isPurchasing = false

  success?: () => void
  fail?: (err: PurchaseError | Error) => void
}

export const purchaseListener = new PurchaseListener()

export function getProducts(skus?: string[]) {
  return RNIap.getSubscriptions(
    skus ||
      (Platform.OS === 'android'
        ? ['todorant.monthly', 'todorant.yearly']
        : ['monthly', 'yearly'])
  )
}

async function tryPurchase(purchase: SubscriptionPurchase) {
  try {
    const receipt = purchase.transactionReceipt

    if (receipt && (purchase.purchaseToken || purchase.transactionReceipt)) {
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
  } catch (err) {
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
