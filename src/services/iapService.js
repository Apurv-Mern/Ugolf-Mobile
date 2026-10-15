// import {
//   initConnection,
//   endConnection,
//   getSubscriptions,
//   requestSubscription,
//   purchaseUpdatedListener,
//   purchaseErrorListener,
//   finishTransaction,
// } from 'react-native-iap';
// import { verifyGooglePurchaseApi } from './playerService';
// import { Platform } from 'react-native';

// export const SUBSCRIPTION_SKUS = Platform.select({
//   android: ['universal_golf_subscription:monthly', 'universal_golf_subscription:yearly'],
//   ios: ['com.universalgolf.monthly', 'com.universalgolf.yearly'],
//   default: ['universal_golf_subscription:monthly'],
// });

// /**
//  * Initializes connection to Google Play / App Store Billing
//  */
// export const initIapConnection = async () => {
//   try {
//     const result = await initConnection();
//     console.log('[IAP] Connection initialized:', result);
//     return true;
//   } catch (error) {
//     console.log('[IAP] Error initializing connection:', error);
//     return false;
//   }
// };

// /**
//  * Fetches available subscription packages from Play Store
//  */
// export const fetchIapSubscriptions = async (skus = SUBSCRIPTION_SKUS) => {
//   try {
//     const subscriptions = await getSubscriptions({ skus });
//     console.log('[IAP] Subscriptions loaded:', subscriptions);
//     return subscriptions;
//   } catch (error) {
//     console.log('[IAP] Error fetching subscriptions:', error);
//     return [];
//   }
// };

// /**
//  * Triggers native subscription checkout flow
//  */
// export const buySubscription = async (sku = SUBSCRIPTION_SKUS[0]) => {
//   try {
//     console.log('[IAP] Requesting subscription for SKU:', sku);
//     await requestSubscription({ sku });
//   } catch (error) {
//     console.log('[IAP] Error requesting subscription:', error);
//     throw error;
//   }
// };

// /**
//  * Sets up global listeners for purchase events
//  */
// export const setupIapListeners = (onSuccess, onError) => {
//   const purchaseUpdateSubscription = purchaseUpdatedListener(async (purchase) => {
//     console.log('[IAP] Purchase updated:', purchase);
//     const receipt = purchase.transactionReceipt || purchase.purchaseToken;

//     if (receipt) {
//       try {
//         const payload = {
//           packageName: 'com.universalgolf',
//           productId: purchase.productId || SUBSCRIPTION_SKUS[0],
//           purchaseToken: purchase.purchaseToken || receipt,
//           transactionId: purchase.transactionId || purchase.orderId,
//           platform: Platform.OS,
//         };

//         await verifyGooglePurchaseApi(payload);
//         await finishTransaction({ purchase, isConsumable: false });

//         if (typeof onSuccess === 'function') {
//           onSuccess(purchase);
//         }
//       } catch (err) {
//         console.log('[IAP] Error verifying purchase with backend:', err);
//         if (typeof onError === 'function') onError(err);
//       }
//     }
//   });

//   const purchaseErrorSubscription = purchaseErrorListener((error) => {
//     console.log('[IAP] Purchase error:', error);
//     if (typeof onError === 'function') {
//       onError(error);
//     }
//   });

//   return () => {
//     purchaseUpdateSubscription.remove();
//     purchaseErrorSubscription.remove();
//     endConnection();
//   };
// };



import {
  initConnection,
  endConnection,
  fetchProducts,
  requestPurchase,
  purchaseUpdatedListener,
  purchaseErrorListener,
  finishTransaction,
} from 'react-native-iap';

import { Platform } from 'react-native';
import { verifyGooglePurchaseApi } from './playerService';

export const GOOGLE_SUBSCRIPTION_ID = 'universal_golf_subscription';

export const SUBSCRIPTION_SKUS = Platform.select({
  android: [GOOGLE_SUBSCRIPTION_ID],
  ios: ['com.universalgolf.monthly', 'com.universalgolf.yearly'],
  default: [GOOGLE_SUBSCRIPTION_ID],
});

/**
 * Initialize Google Play Billing.
 */
export const initIapConnection = async () => {
  try {
    const result = await initConnection();
    console.log('[IAP] Connection initialized:', result);
    return true;
  } catch (error) {
    console.log('[IAP] Connection initialization failed:', error);
    return false;
  }
};

/**
 * Fetch the subscription product and its available base-plan offers.
 */
export const fetchIapSubscriptions = async (skus = SUBSCRIPTION_SKUS) => {
  try {
    const products = await fetchProducts({
      skus,
      type: 'subs',
    });

    console.log(
      '[IAP] Subscription products:',
      JSON.stringify(products, null, 2),
    );

    return products ?? [];
  } catch (error) {
    console.log('[IAP] Error fetching subscriptions:', error);
    return [];
  }
};

/**
 * Start a monthly or yearly Google Play subscription.
 * The planId must match a base plan in Play Console.
 */
export const buySubscription = async (planId = 'monthly') => {
  if (Platform.OS !== 'android') {
    throw new Error('This purchase function is currently Android-only.');
  }

  if (!['monthly', 'yearly'].includes(planId)) {
    throw new Error(`Unsupported subscription plan: ${planId}`);
  }

  try {
    const products = await fetchIapSubscriptions([
      GOOGLE_SUBSCRIPTION_ID,
    ]);

    const product = products.find(
      item =>
        item.id === GOOGLE_SUBSCRIPTION_ID ||
        item.productId === GOOGLE_SUBSCRIPTION_ID,
    );

    if (!product) {
      throw new Error(
        'Subscription product not returned by Google Play. ' +
        'Check the product ID, tester account, and Play Console release.',
      );
    }

    const offers = product.subscriptionOfferDetailsAndroid ?? [];

    // A base plan may be returned as an offer detail even without
    // a promotional discount. Select the plan configured in Play Console.
    const selectedOffer = offers.find(
      offer => offer.basePlanIdAndroid === planId,
    );

    const offerToken =
      selectedOffer?.offerTokenAndroid ??
      selectedOffer?.offerToken;

    if (!selectedOffer || !offerToken) {
      console.log(
        '[IAP] Available subscription offers:',
        JSON.stringify(offers, null, 2),
      );

      throw new Error(
        `Could not find an offer token for the ${planId} base plan.`,
      );
    }

    console.log('[IAP] Starting checkout:', {
      productId: GOOGLE_SUBSCRIPTION_ID,
      basePlanId: planId,
    });

    await requestPurchase({
      request: {
        google: {
          skus: [GOOGLE_SUBSCRIPTION_ID],
          subscriptionOffers: [
            {
              sku: GOOGLE_SUBSCRIPTION_ID,
              offerToken,
            },
          ],
        },
      },
      type: 'subs',
    });
  } catch (error) {
    console.log('[IAP] Purchase request failed:', error);
    throw error;
  }
};

/**
 * Listen for purchase events.
 *
 * The backend must verify the purchase with Google Play before
 * the app grants subscription access.
 */
export const setupIapListeners = (onSuccess, onError) => {
  const purchaseUpdateSubscription = purchaseUpdatedListener(
    async purchase => {
      console.log('[IAP] Purchase update received:', {
        productId: purchase.productId,
        transactionId: purchase.transactionId,
        hasPurchaseToken: Boolean(purchase.purchaseToken),
      });

      if (Platform.OS !== 'android') {
        onError?.(
          new Error('This listener currently verifies Android purchases only.'),
        );
        return;
      }

      if (!purchase.purchaseToken) {
        onError?.(new Error('Google Play purchase token is missing.'));
        return;
      }

      try {
        const payload = {
          packageName: 'com.universalgolf',
          productId: purchase.productId || GOOGLE_SUBSCRIPTION_ID,
          purchaseToken: purchase.purchaseToken,
          transactionId: purchase.transactionId || purchase.orderId || null,
          platform: 'android',
        };

        // This API must call Google Play's server-side verification API.
        const verification = await verifyGooglePurchaseApi(payload);

        console.log('[IAP] Backend verification completed.');

        // Only finish the transaction after the backend accepts it.
        // The backend should acknowledge the purchase with Google Play.
        await finishTransaction({
          purchase,
          isConsumable: false,
        });

        onSuccess?.(purchase, verification);
      } catch (error) {
        console.log('[IAP] Purchase verification failed:', error);
        onError?.(error);
      }
    },
  );

  const purchaseErrorSubscription = purchaseErrorListener(error => {
    console.log('[IAP] Purchase error:', error);
    onError?.(error);
  });

  return () => {
    purchaseUpdateSubscription.remove();
    purchaseErrorSubscription.remove();
    endConnection();
  };
};
