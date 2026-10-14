import {
  initConnection,
  endConnection,
  getSubscriptions,
  requestSubscription,
  purchaseUpdatedListener,
  purchaseErrorListener,
  finishTransaction,
} from 'react-native-iap';
import { verifyGooglePurchaseApi } from './playerService';
import { Platform } from 'react-native';

export const SUBSCRIPTION_SKUS = Platform.select({
  android: ['universal_golf_subscription:monthly', 'universal_golf_subscription:yearly'],
  ios: ['com.universalgolf.monthly', 'com.universalgolf.yearly'],
  default: ['universal_golf_subscription:monthly'],
});

/**
 * Initializes connection to Google Play / App Store Billing
 */
export const initIapConnection = async () => {
  try {
    const result = await initConnection();
    console.log('[IAP] Connection initialized:', result);
    return true;
  } catch (error) {
    console.log('[IAP] Error initializing connection:', error);
    return false;
  }
};

/**
 * Fetches available subscription packages from Play Store
 */
export const fetchIapSubscriptions = async (skus = SUBSCRIPTION_SKUS) => {
  try {
    const subscriptions = await getSubscriptions({ skus });
    console.log('[IAP] Subscriptions loaded:', subscriptions);
    return subscriptions;
  } catch (error) {
    console.log('[IAP] Error fetching subscriptions:', error);
    return [];
  }
};

/**
 * Triggers native subscription checkout flow
 */
export const buySubscription = async (sku = SUBSCRIPTION_SKUS[0]) => {
  try {
    console.log('[IAP] Requesting subscription for SKU:', sku);
    await requestSubscription({ sku });
  } catch (error) {
    console.log('[IAP] Error requesting subscription:', error);
    throw error;
  }
};

/**
 * Sets up global listeners for purchase events
 */
export const setupIapListeners = (onSuccess, onError) => {
  const purchaseUpdateSubscription = purchaseUpdatedListener(async (purchase) => {
    console.log('[IAP] Purchase updated:', purchase);
    const receipt = purchase.transactionReceipt || purchase.purchaseToken;

    if (receipt) {
      try {
        const payload = {
          packageName: 'com.universalgolf',
          productId: purchase.productId || SUBSCRIPTION_SKUS[0],
          purchaseToken: purchase.purchaseToken || receipt,
          transactionId: purchase.transactionId || purchase.orderId,
          platform: Platform.OS,
        };

        await verifyGooglePurchaseApi(payload);
        await finishTransaction({ purchase, isConsumable: false });

        if (typeof onSuccess === 'function') {
          onSuccess(purchase);
        }
      } catch (err) {
        console.log('[IAP] Error verifying purchase with backend:', err);
        if (typeof onError === 'function') onError(err);
      }
    }
  });

  const purchaseErrorSubscription = purchaseErrorListener((error) => {
    console.log('[IAP] Purchase error:', error);
    if (typeof onError === 'function') {
      onError(error);
    }
  });

  return () => {
    purchaseUpdateSubscription.remove();
    purchaseErrorSubscription.remove();
    endConnection();
  };
};
