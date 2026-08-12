import { supabase } from '@/lib/supabase';

export type ShippingQuote = {
  ok: boolean;
  error?: string;
  shipping_rate_id?: string;
  service_level?: string;
  quantity?: number;
  amount_cents?: number;
  currency?: string;
  payment_required?: boolean;
  revenuecat_product_id?: string | null;
  revenuecat_offering_id?: string | null;
  label?: string | null;
};

export type CommerceOrder = {
  id: string;
  order_type: string;
  user_id: string | null;
  authenticated_asset_id: string | null;
  qr_sticker_id: string | null;
  service_level: string | null;
  quantity: number;
  amount_cents: number;
  currency: string;
  payment_required: boolean;
  revenuecat_product_id: string | null;
  status: string;
  shipping_name: string | null;
  shipping_address_line1: string | null;
  shipping_address_line2: string | null;
  shipping_city: string | null;
  shipping_state: string | null;
  shipping_postal_code: string | null;
  shipping_country: string | null;
  phone: string | null;
  email: string | null;
  created_at: string;
  paid_at: string | null;
  fulfillment_ready_at: string | null;
};

export type ShippingAddressInput = {
  shipping_name: string;
  shipping_address_line1: string;
  shipping_address_line2?: string;
  shipping_city: string;
  shipping_state?: string;
  shipping_postal_code: string;
  shipping_country?: string;
  phone?: string;
  email?: string;
};

export async function quoteShipping(
  serviceLevel: string,
  quantity = 1
): Promise<{ quote: ShippingQuote | null; error: string | null }> {
  const { data, error } = await supabase.rpc('quote_shipping', {
    p_service_level: serviceLevel,
    p_quantity: quantity
  });
  if (error) return { quote: null, error: error.message };
  return { quote: (data ?? null) as ShippingQuote | null, error: null };
}

export async function createStickerShippingOrder(
  assetId: string,
  serviceLevel: string,
  address: ShippingAddressInput,
  quantity = 1
): Promise<{
  order: CommerceOrder | null;
  paymentRequired: boolean;
  productId: string | null;
  error: string | null;
}> {
  const { data, error } = await supabase.rpc('create_sticker_shipping_order', {
    p_authenticated_asset_id: assetId,
    p_service_level: serviceLevel,
    p_quantity: quantity,
    p_shipping_name: address.shipping_name,
    p_shipping_address_line1: address.shipping_address_line1,
    p_shipping_address_line2: address.shipping_address_line2 ?? null,
    p_shipping_city: address.shipping_city,
    p_shipping_state: address.shipping_state ?? null,
    p_shipping_postal_code: address.shipping_postal_code,
    p_shipping_country: address.shipping_country ?? 'US',
    p_phone: address.phone ?? null,
    p_email: address.email ?? null
  });
  if (error) {
    return { order: null, paymentRequired: false, productId: null, error: error.message };
  }
  const payload = data as {
    ok?: boolean;
    order?: CommerceOrder;
    payment_required?: boolean;
    revenuecat_product_id?: string | null;
  };
  return {
    order: payload.order ?? null,
    paymentRequired: Boolean(payload.payment_required),
    productId: payload.revenuecat_product_id ?? payload.order?.revenuecat_product_id ?? null,
    error: null
  };
}

export async function getMyCommerceOrderForAsset(
  assetId: string
): Promise<{ order: CommerceOrder | null; error: string | null }> {
  const { data, error } = await supabase.rpc('get_my_commerce_order_for_asset', {
    p_authenticated_asset_id: assetId
  });
  if (error) return { order: null, error: error.message };
  const payload = data as { order?: CommerceOrder | null };
  return { order: payload.order ?? null, error: null };
}

export async function cancelMyAwaitingPaymentOrder(
  orderId: string
): Promise<{ error: string | null }> {
  const { error } = await supabase.rpc('cancel_my_awaiting_payment_order', {
    p_order_id: orderId
  });
  return { error: error?.message ?? null };
}

export function formatCents(cents: number, currency = 'USD'): string {
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(cents / 100);
  } catch {
    return `$${(cents / 100).toFixed(2)}`;
  }
}

export function orderStatusLabel(status: string | null | undefined): string {
  switch (status) {
    case 'awaiting_payment':
      return 'Awaiting payment';
    case 'paid':
    case 'fulfillment_ready':
      return 'Ready to ship';
    case 'fulfilling':
      return 'In fulfillment';
    case 'mailed':
      return 'Mailed';
    case 'delivered':
      return 'Delivered';
    case 'canceled':
      return 'Canceled';
    case 'refunded':
      return 'Refunded';
    default:
      return status ?? '—';
  }
}

/** Poll until order leaves awaiting_payment or timeout. */
export async function waitForOrderPaid(
  assetId: string,
  opts?: { timeoutMs?: number; intervalMs?: number }
): Promise<{ order: CommerceOrder | null; error: string | null }> {
  const timeoutMs = opts?.timeoutMs ?? 45_000;
  const intervalMs = opts?.intervalMs ?? 2_000;
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    const { order, error } = await getMyCommerceOrderForAsset(assetId);
    if (error) return { order: null, error };
    if (
      order &&
      ['paid', 'fulfillment_ready', 'fulfilling', 'mailed', 'delivered'].includes(order.status)
    ) {
      return { order, error: null };
    }
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  return {
    order: null,
    error: 'Payment is still processing. Pull to refresh on the asset screen in a moment.'
  };
}
