import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthPrimaryButton } from '@/components/auth/AuthPrimaryButton';
import { ProfileSubpageHeader } from '@/components/profile/ProfileSubpageHeader';
import { appFonts } from '@/constants/appFonts';
import { figmaColors } from '@/constants/figmaColors';
import { authenticatedAssetHref } from '@/constants/navigation';
import { useAuth } from '@/context/AuthContext';
import { useFigmaLayout } from '@/hooks/useFigmaLayout';
import {
  createStickerShippingOrder,
  formatCents,
  getMyCommerceOrderForAsset,
  orderStatusLabel,
  quoteShipping,
  waitForOrderPaid,
  type CommerceOrder,
  type ShippingQuote
} from '@/lib/commerce';
import { configurePurchases, isRevenueCatConfigured, purchaseShippingProduct } from '@/lib/revenuecat';

const LEVELS = ['standard', 'priority', 'express'] as const;

export default function StickerShippingScreen() {
  const router = useRouter();
  const { assetId } = useLocalSearchParams<{ assetId: string }>();
  const { user } = useAuth();
  const { s, t } = useFigmaLayout();
  const styles = useMemo(() => createStyles(s, t), [s, t]);

  const [level, setLevel] = useState<(typeof LEVELS)[number]>('standard');
  const [quote, setQuote] = useState<ShippingQuote | null>(null);
  const [existing, setExisting] = useState<CommerceOrder | null>(null);
  const [name, setName] = useState('');
  const [line1, setLine1] = useState('');
  const [line2, setLine2] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [postal, setPostal] = useState('');
  const [country, setCountry] = useState('US');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState(user?.email ?? '');
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!assetId || typeof assetId !== 'string') return;
    setLoading(true);
    const [{ order }, { quote: q, error: qErr }] = await Promise.all([
      getMyCommerceOrderForAsset(assetId),
      quoteShipping(level, 1)
    ]);
    if (order) {
      setExisting(order);
      setName(order.shipping_name ?? '');
      setLine1(order.shipping_address_line1 ?? '');
      setLine2(order.shipping_address_line2 ?? '');
      setCity(order.shipping_city ?? '');
      setState(order.shipping_state ?? '');
      setPostal(order.shipping_postal_code ?? '');
      setCountry(order.shipping_country ?? 'US');
      setPhone(order.phone ?? '');
      setEmail(order.email ?? user?.email ?? '');
      if (order.service_level === 'priority' || order.service_level === 'express') {
        setLevel(order.service_level);
      }
    }
    if (qErr) setError(qErr);
    else setQuote(q);
    setLoading(false);
  }, [assetId, level, user?.email]);

  useEffect(() => {
    void configurePurchases();
    void load();
  }, [load]);

  useEffect(() => {
    let active = true;
    void quoteShipping(level, 1).then(({ quote: q, error: qErr }) => {
      if (!active) return;
      if (qErr) setError(qErr);
      else {
        setQuote(q);
        setError(null);
      }
    });
    return () => {
      active = false;
    };
  }, [level]);

  async function onConfirm() {
    if (!assetId || typeof assetId !== 'string') return;
    setBusy(true);
    setError(null);
    setMessage(null);

    const created = await createStickerShippingOrder(assetId, level, {
      shipping_name: name,
      shipping_address_line1: line1,
      shipping_address_line2: line2,
      shipping_city: city,
      shipping_state: state,
      shipping_postal_code: postal,
      shipping_country: country,
      phone,
      email
    });

    if (created.error || !created.order) {
      setBusy(false);
      setError(created.error ?? 'Could not create order.');
      return;
    }

    setExisting(created.order);

    if (!created.paymentRequired) {
      setBusy(false);
      setMessage('Order ready — postage is free for launch. Ops can mail your sticker.');
      return;
    }

    if (!isRevenueCatConfigured()) {
      setBusy(false);
      setError(
        'Paid shipping needs RevenueCat keys on this build. Order is awaiting payment — configure keys or use a free rate.'
      );
      return;
    }

    const productId = created.productId;
    if (!productId) {
      setBusy(false);
      setError('No RevenueCat product mapped for this rate.');
      return;
    }

    const purchase = await purchaseShippingProduct(productId);
    if (purchase.cancelled) {
      setBusy(false);
      setMessage('Purchase canceled. You can retry when ready.');
      return;
    }
    if (purchase.error) {
      setBusy(false);
      setError(purchase.error);
      return;
    }

    setMessage('Confirming payment…');
    const waited = await waitForOrderPaid(assetId);
    setBusy(false);
    if (waited.error) {
      setError(waited.error);
      return;
    }
    setExisting(waited.order);
    setMessage('Payment confirmed. Your sticker is ready for fulfillment.');
  }

  const paidDone =
    existing &&
    ['paid', 'fulfillment_ready', 'fulfilling', 'mailed', 'delivered'].includes(existing.status);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <ProfileSubpageHeader
          title="Ship sticker"
          subtitle="Physical QR sticker mailing"
          s={s}
          t={t}
          onBack={() => router.back()}
        />

        {loading ? <ActivityIndicator color={figmaColors.charcoal} /> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {message ? <Text style={styles.message}>{message}</Text> : null}

        {existing ? (
          <Text style={styles.status}>
            Order: {orderStatusLabel(existing.status)}
            {existing.payment_required
              ? ` · ${formatCents(existing.amount_cents, existing.currency)}`
              : ' · Free'}
          </Text>
        ) : null}

        {paidDone ? (
          <AuthPrimaryButton
            label="Back to asset"
            onPress={() => router.replace(authenticatedAssetHref(String(assetId)))}
          />
        ) : (
          <>
            <Text style={styles.section}>Shipping speed</Text>
            <View style={styles.levelRow}>
              {LEVELS.map((l) => (
                <Pressable
                  key={l}
                  style={[styles.levelChip, level === l && styles.levelChipOn]}
                  onPress={() => setLevel(l)}
                >
                  <Text style={[styles.levelText, level === l && styles.levelTextOn]}>{l}</Text>
                </Pressable>
              ))}
            </View>
            {quote?.ok ? (
              <Text style={styles.quote}>
                {quote.payment_required
                  ? formatCents(quote.amount_cents ?? 0, quote.currency ?? 'USD')
                  : 'Free (launch postage)'}
                {quote.label ? ` — ${quote.label}` : ''}
              </Text>
            ) : null}

            <Text style={styles.section}>Address</Text>
            {(
              [
                ['Full name', name, setName],
                ['Address line 1', line1, setLine1],
                ['Address line 2', line2, setLine2],
                ['City', city, setCity],
                ['State', state, setState],
                ['Postal code', postal, setPostal],
                ['Country', country, setCountry],
                ['Phone', phone, setPhone],
                ['Email', email, setEmail]
              ] as const
            ).map(([label, value, setter]) => (
              <View key={label} style={styles.field}>
                <Text style={styles.label}>{label}</Text>
                <TextInput
                  style={styles.input}
                  value={value}
                  onChangeText={setter}
                  autoCapitalize={label === 'Email' ? 'none' : 'words'}
                  keyboardType={
                    label === 'Email' ? 'email-address' : label === 'Phone' ? 'phone-pad' : 'default'
                  }
                />
              </View>
            ))}

            <AuthPrimaryButton
              label={busy ? 'Working…' : quote?.payment_required ? 'Pay & request sticker' : 'Request sticker'}
              onPress={() => void onConfirm()}
              disabled={busy}
            />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(s: (n: number) => number, t: (n: number) => number) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: figmaColors.background },
    content: { paddingHorizontal: s(16), paddingBottom: s(40), gap: s(8) },
    error: { fontFamily: appFonts.body, fontSize: t(14), color: figmaColors.error },
    message: { fontFamily: appFonts.body, fontSize: t(14), color: figmaColors.bronze },
    status: {
      fontFamily: appFonts.body,
      fontSize: t(15),
      color: figmaColors.charcoal,
      marginBottom: s(8)
    },
    section: {
      marginTop: s(12),
      fontFamily: appFonts.bodyBold ?? appFonts.body,
      fontSize: t(15),
      color: figmaColors.charcoal
    },
    levelRow: { flexDirection: 'row', flexWrap: 'wrap', gap: s(8) },
    levelChip: {
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      borderRadius: s(20),
      paddingHorizontal: s(12),
      paddingVertical: s(8),
      backgroundColor: figmaColors.cream
    },
    levelChipOn: { borderColor: figmaColors.bronze, backgroundColor: figmaColors.charcoal },
    levelText: {
      fontFamily: appFonts.body,
      fontSize: t(13),
      color: figmaColors.charcoal,
      textTransform: 'capitalize'
    },
    levelTextOn: { color: figmaColors.cream },
    quote: { fontFamily: appFonts.body, fontSize: t(14), color: figmaColors.gray },
    field: { gap: s(4) },
    label: { fontFamily: appFonts.body, fontSize: t(12), color: figmaColors.gray },
    input: {
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      borderRadius: s(10),
      paddingHorizontal: s(12),
      paddingVertical: s(10),
      fontFamily: appFonts.body,
      fontSize: t(16),
      color: figmaColors.charcoal,
      backgroundColor: figmaColors.cream
    }
  });
}
