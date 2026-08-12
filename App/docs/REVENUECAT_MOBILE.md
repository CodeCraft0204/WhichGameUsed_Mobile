# RevenueCat mobile (Phase 2)

Physical sticker shipping unlocks are sold only through **RevenueCat → Apple IAP / Google Play**. No Stripe in the app.

## App env

In `Codebase/Mobile/App/.env`:

```
EXPO_PUBLIC_REVENUECAT_IOS_KEY=appl_...
EXPO_PUBLIC_REVENUECAT_ANDROID_KEY=goog_...
```

`AuthContext` calls `Purchases.configure` / `logIn(supabaseUserId)` / `logOut` automatically on **iOS/Android** (`lib/revenuecat.native.ts`). Web uses a no-op stub — IAP cannot run in the browser / Expo web.

## Products

1. Create products in App Store Connect and Google Play Console.
2. Mirror them in RevenueCat with the **same product identifiers**.
3. In portal **Commerce → Shipping rates**, set `revenuecat_product_id` on each **paid** active band.
4. Keep store prices aligned with `amount_cents`.

Launch **standard $0** bands do not need IAP — mobile skips purchase when `payment_required` is false.

## Webhook

Deploy `revenuecat-webhook` (Phase 1). Set `REVENUECAT_WEBHOOK_SECRET`.  
Identify users with Supabase `auth.uid()` as RC `appUserID` (already wired).

## Mobile flow

1. Owner opens `/database/asset/[id]` → **Request physical sticker**
2. `/commerce/sticker-shipping/[assetId]` → address + rate → `create_sticker_shipping_order`
3. Free → `fulfillment_ready`; paid → Store purchase → webhook → poll until paid
4. Ops mails from portal Stickers (blocked if unpaid paid order)

## Apply migrations

1. `20260806120000_commerce_revenuecat_shipping.sql` (Phase 1)
2. `20260810120000_commerce_mobile_checkout.sql` (Phase 2 RPCs)
