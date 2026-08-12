/**
 * Web stub — `react-native-purchases` is native-only (iOS/Android).
 * Metro uses `revenuecat.native.ts` on device builds.
 */

export function isRevenueCatConfigured(): boolean {
  return false;
}

export async function configurePurchases(): Promise<void> {}

export async function revenueCatLogIn(_userId: string): Promise<void> {}

export async function revenueCatLogOut(): Promise<void> {}

export async function purchaseShippingProduct(
  _productId: string
): Promise<{ result: null; cancelled: boolean; error: string | null }> {
  return {
    result: null,
    cancelled: false,
    error: 'In-app purchases are only available on iOS and Android builds.'
  };
}

export async function findPackageForProduct(_productId: string): Promise<null> {
  return null;
}
