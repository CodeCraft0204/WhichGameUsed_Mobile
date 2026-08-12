import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CardImagePager } from '@/components/database/CardImagePager';
import { ProfileSubpageHeader } from '@/components/profile/ProfileSubpageHeader';
import { AuthPrimaryButton } from '@/components/auth/AuthPrimaryButton';
import { databaseIcons } from '@/constants/databaseContent';
import { appFonts } from '@/constants/appFonts';
import { databaseCopy } from '@/constants/databaseCopy';
import { figmaColors } from '@/constants/figmaColors';
import {
  databaseCardHref,
  databaseVerificationHref,
  stickerShippingHref
} from '@/constants/navigation';
import { useAuth } from '@/context/AuthContext';
import { useFigmaLayout } from '@/hooks/useFigmaLayout';
import {
  getAuthenticatedAssetById,
  getCardById,
  type CardDetail
} from '@/lib/cards';
import {
  formatCents,
  getMyCommerceOrderForAsset,
  orderStatusLabel,
  type CommerceOrder
} from '@/lib/commerce';
import { getCurrentStickerStatusForAsset, stickerStatusLabel } from '@/lib/verification';

export default function AuthenticatedAssetScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { s, t } = useFigmaLayout();
  const styles = useMemo(() => createStyles(s, t), [s, t]);
  const [card, setCard] = useState<CardDetail | null>(null);
  const [assetUuid, setAssetUuid] = useState('');
  const [assetId, setAssetId] = useState('');
  const [ownerUserId, setOwnerUserId] = useState<string | null>(null);
  const [authenticatedAt, setAuthenticatedAt] = useState<string | null>(null);
  const [stickerStatus, setStickerStatus] = useState<string | null>(null);
  const [order, setOrder] = useState<CommerceOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id || typeof id !== 'string') return;
    setLoading(true);
    const assetRes = await getAuthenticatedAssetById(id);
    if (assetRes.error || !assetRes.asset) {
      setError(assetRes.error ?? 'Asset not found.');
      setLoading(false);
      return;
    }
    const asset = assetRes.asset;
    setAssetUuid(asset.id);
    setAssetId(asset.asset_id);
    setOwnerUserId(asset.owner_user_id ?? null);
    setAuthenticatedAt(asset.authenticated_at);
    const [cardRes, stickerRes, orderRes] = await Promise.all([
      getCardById(asset.card_id),
      getCurrentStickerStatusForAsset(asset.id),
      user?.id ? getMyCommerceOrderForAsset(asset.id) : Promise.resolve({ order: null, error: null })
    ]);
    setCard(cardRes.card);
    setStickerStatus(stickerRes.status);
    setOrder(orderRes.order);
    setError(cardRes.error ?? stickerRes.error ?? orderRes.error);
    setLoading(false);
  }, [id, user?.id]);

  useEffect(() => {
    void load();
  }, [load]);

  const isOwner = Boolean(user?.id && ownerUserId && user.id === ownerUserId);
  const stickerAlreadyShipped =
    stickerStatus === 'mailed' || stickerStatus === 'active';
  const showShipCta =
    isOwner &&
    !stickerAlreadyShipped &&
    !(order && ['mailed', 'delivered'].includes(order.status));

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <ProfileSubpageHeader
          title={databaseCopy.assetDetailTitle}
          subtitle={card?.title}
          s={s}
          t={t}
          onBack={() => router.back()}
        />

        {loading ? <ActivityIndicator color={figmaColors.charcoal} /> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}

        {card ? (
          <>
            <CardImagePager
              frontSource={card.imageUrl ? { uri: card.imageUrl } : databaseIcons.recordMantle}
              backSource={card.backImageUrl ? { uri: card.backImageUrl } : databaseIcons.recordJordan}
              s={s}
              t={t}
            />
            <View style={styles.card}>
              <Text style={styles.label}>{databaseCopy.assetId}</Text>
              <Text style={styles.value}>{assetId}</Text>
              <Text style={styles.label}>{databaseCopy.authenticatedAt}</Text>
              <Text style={styles.value}>
                {authenticatedAt ? new Date(authenticatedAt).toLocaleString() : '—'}
              </Text>
              <Text style={styles.label}>Sticker</Text>
              <Text style={styles.value}>{stickerStatusLabel(stickerStatus)}</Text>
              {order ? (
                <>
                  <Text style={styles.label}>Shipping order</Text>
                  <Text style={styles.value}>
                    {orderStatusLabel(order.status)}
                    {order.payment_required
                      ? ` · ${formatCents(order.amount_cents, order.currency)}`
                      : ' · Free'}
                  </Text>
                </>
              ) : null}
            </View>
            <AuthPrimaryButton
              label={databaseCopy.viewCatalogCard}
              onPress={() => router.push(databaseCardHref(card.id))}
            />
            {showShipCta && assetUuid ? (
              <AuthPrimaryButton
                label={
                  order?.status === 'awaiting_payment'
                    ? 'Complete sticker shipping'
                    : 'Request physical sticker'
                }
                onPress={() => router.push(stickerShippingHref(assetUuid))}
              />
            ) : null}
            {assetId ? (
              <Pressable
                style={styles.secondary}
                onPress={() => router.push(databaseVerificationHref(assetId))}
              >
                <Text style={styles.secondaryText}>{databaseCopy.viewVerification}</Text>
              </Pressable>
            ) : null}
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(s: (n: number) => number, t: (n: number) => number) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: figmaColors.background },
    content: { paddingHorizontal: s(16), paddingBottom: s(32) },
    error: {
      fontFamily: appFonts.body,
      fontSize: t(14),
      color: figmaColors.error
    },
    card: {
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      borderRadius: s(12),
      padding: s(16),
      marginVertical: s(16),
      backgroundColor: figmaColors.cream,
      gap: s(8)
    },
    label: {
      fontFamily: appFonts.body,
      fontSize: t(12),
      color: figmaColors.gray
    },
    value: {
      fontFamily: appFonts.body,
      fontSize: t(17),
      color: figmaColors.charcoal,
      marginBottom: s(8)
    },
    secondary: {
      marginTop: s(10),
      alignItems: 'center',
      paddingVertical: s(12)
    },
    secondaryText: {
      fontFamily: appFonts.body,
      fontSize: t(16),
      color: figmaColors.bronze
    }
  });
}
