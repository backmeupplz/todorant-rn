import { translate } from '@utils/i18n'
import RNIap, {
  purchaseUpdatedListener,
  purchaseErrorListener,
  SubscriptionPurchase,
  PurchaseError,
} from 'react-native-iap'
import { observable } from 'mobx'
import * as rest from '@utils/rest'

class PurchaseListener {
  @observable isPurchasing = false

  success?: () => void
  fail?: (err: PurchaseError | Error) => void
}

export const purchaseListener = new PurchaseListener()

export function getProducts() {
  return RNIap.getSubscriptions(['todorant.monthly', 'todorant.yearly'])
}

export const purchaseUpdateSubscription = purchaseUpdatedListener(
  async (purchase: SubscriptionPurchase) => {
    try {
      const receipt = purchase.transactionReceipt

      if (receipt && purchase.purchaseToken) {
        await rest.verifyPurchaseGoogle({
          packageName: 'com.todorant',
          productId: purchase.productId,
          purchaseToken: purchase.purchaseToken,
        })
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
)

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
  return RNIap.requestSubscription(sku)
}
