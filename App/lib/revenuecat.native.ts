import Purchases, { type MakePurchaseResult, type PurchasesPackage } from 'react-native-purchases';
import { Platform } from 'react-native';

let configured = false;

function iosKey(): string {
  return (process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY ?? '').trim();
}

function androidKey(): string {
  return (process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY ?? '').trim();
}

export function isRevenueCatConfigured(): boolean {
  if (Platform.OS === 'ios') return iosKey().length > 0;
  if (Platform.OS === 'android') return androidKey().length > 0;
  return false;
}

/** Call once at app bootstrap. Safe to call repeatedly. */
export async function configurePurchases(): Promise<void> {
  if (configured) return;
  const apiKey = Platform.OS === 'ios' ? iosKey() : androidKey();
  if (!apiKey) {
    console.warn('[revenuecat] Missing EXPO_PUBLIC_REVENUECAT_IOS_KEY / ANDROID_KEY');
    return;
  }
  Purchases.configure({ apiKey });
  configured = true;
}

export async function revenueCatLogIn(userId: string): Promise<void> {
  if (!configured && isRevenueCatConfigured()) await configurePurchases();
  if (!configured || !userId) return;
  try {
    await Purchases.logIn(userId);
  } catch (err) {
    console.warn('[revenuecat] logIn failed', err);
  }
}

export async function revenueCatLogOut(): Promise<void> {
  if (!configured) return;
  try {
    await Purchases.logOut();
  } catch (err) {
    console.warn('[revenuecat] logOut failed', err);
  }
}

export async function purchaseShippingProduct(
  productId: string
): Promise<{ result: MakePurchaseResult | null; cancelled: boolean; error: string | null }> {
  if (!configured && isRevenueCatConfigured()) await configurePurchases();
  if (!configured) {
    return {
      result: null,
      cancelled: false,
      error: 'In-app purchases are not configured on this build.'
    };
  }
  try {
    const products = await Purchases.getProducts([productId]);
    const product = products.find((p) => p.identifier === productId) ?? products[0];
    if (!product) {
      return {
        result: null,
        cancelled: false,
        error: `Store product not found: ${productId}`
      };
    }
    const result = await Purchases.purchaseStoreProduct(product);
    return { result, cancelled: false, error: null };
  } catch (err: unknown) {
    const anyErr = err as { userCancelled?: boolean; message?: string };
    if (anyErr?.userCancelled) {
      return { result: null, cancelled: true, error: null };
    }
    return {
      result: null,
      cancelled: false,
      error: anyErr?.message ?? 'Purchase failed.'
    };
  }
}

/** Optional: resolve package from current offering by product id. */
export async function findPackageForProduct(
  productId: string
): Promise<PurchasesPackage | null> {
  if (!configured) return null;
  try {
    const offerings = await Purchases.getOfferings();
    const current = offerings.current;
    if (!current) return null;
    return (
      current.availablePackages.find((pkg) => pkg.product.identifier === productId) ?? null
    );
  } catch {
    return null;
  }
}
