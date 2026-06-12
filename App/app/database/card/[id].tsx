import { Ionicons } from '@expo/vector-icons';
import { appFonts } from '@/constants/appFonts';
import { bodyText, broadsheetAccent } from '@/constants/appTypography';
import * as Linking from 'expo-linking';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthPrimaryButton } from '@/components/auth/AuthPrimaryButton';
import { CardImagePager } from '@/components/database/CardImagePager';
import { databaseIcons } from '@/constants/databaseContent';
import { databaseCopy } from '@/constants/databaseCopy';
import { figmaColors } from '@/constants/figmaColors';
import { useAuth } from '@/context/AuthContext';
import { useFigmaLayout } from '@/hooks/useFigmaLayout';
import {
  getCardById,
  listAuthenticatedAssetsForCard,
  type AuthenticatedAssetSummary,
  type CardDetail
} from '@/lib/cards';
import { absolutePortalUrl } from '@/lib/portal-url';
import { addCardToWishlist, isCardOnWishlist } from '@/lib/wishlist';

function DetailRow({
  label,
  value,
  styles
}: {
  label: string;
  value: string | null | undefined;
  styles: ReturnType<typeof createStyles>;
}) {
  if (!value?.trim()) return null;
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

export default function CardDetailScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { s, t } = useFigmaLayout();
  const styles = useMemo(() => createStyles(s, t), [s, t]);

  const [card, setCard] = useState<CardDetail | null>(null);
  const [assets, setAssets] = useState<AuthenticatedAssetSummary[]>([]);
  const [onWishlist, setOnWishlist] = useState(false);
  const [wishBusy, setWishBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id || typeof id !== 'string') return;
    let active = true;
    setLoading(true);
    void Promise.all([getCardById(id), listAuthenticatedAssetsForCard(id), isCardOnWishlist(id)]).then(
      ([cardResult, assetsResult, wishlisted]) => {
        if (!active) return;
        setCard(cardResult.card);
        setAssets(assetsResult.items);
        setOnWishlist(wishlisted);
        setError(cardResult.error ?? assetsResult.error);
        setLoading(false);
      }
    );
    return () => {
      active = false;
    };
  }, [id]);

  const openVerification = (asset: AuthenticatedAssetSummary) => {
    const url = absolutePortalUrl(asset.verification_url);
    if (url) void Linking.openURL(url);
  };

  const toggleWishlist = async () => {
    if (!user) {
      router.replace('/sign-in/sign-in');
      return;
    }
    if (!card || onWishlist || wishBusy) return;
    setWishBusy(true);
    const { error: wishError } = await addCardToWishlist(user.id, card.id);
    setWishBusy(false);
    if (!wishError) setOnWishlist(true);
  };

  const subtitle = card?.product_full_name ?? card?.product_name ?? undefined;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Pressable style={styles.backRow} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={s(22)} color={figmaColors.charcoal} />
          <Text style={styles.backText}>{databaseCopy.backToResults}</Text>
        </Pressable>

        {loading ? <ActivityIndicator color={figmaColors.charcoal} style={styles.loader} /> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}

        {card ? (
          <>
            <Text style={styles.cardTitle}>{card.title}</Text>
            {subtitle ? <Text style={styles.cardSubtitle}>{subtitle}</Text> : null}

            <View style={styles.tagRow}>
              {card.sport_name ? (
                <View style={styles.tag}>
                  <Text style={styles.tagText}>{card.sport_name.toUpperCase()}</Text>
                </View>
              ) : null}
              {card.memorabilia_type ? (
                <View style={styles.tag}>
                  <Text style={styles.tagText}>{card.memorabilia_type.toUpperCase()}</Text>
                </View>
              ) : null}
              {card.authenticated_count > 0 ? (
                <View style={[styles.tag, styles.tagAuth]}>
                  <Ionicons name="shield-checkmark" size={s(14)} color={figmaColors.success} />
                  <Text style={[styles.tagText, styles.tagAuthText]}>AUTHENTICATED</Text>
                </View>
              ) : null}
            </View>

            <CardImagePager
              frontSource={card.imageUrl ? { uri: card.imageUrl } : databaseIcons.recordMantle}
              backSource={
                card.backImageUrl ? { uri: card.backImageUrl } : databaseIcons.recordJordan
              }
              s={s}
              t={t}
            />

            <View style={styles.actions}>
              <AuthPrimaryButton
                label={onWishlist ? databaseCopy.onWishlist : databaseCopy.addToWishlist}
                onPress={() => void toggleWishlist()}
                disabled={onWishlist || wishBusy}
              />
              <Pressable
                style={styles.secondaryBtn}
                onPress={() => router.push('/create/create')}
              >
                <Ionicons name="scan-outline" size={s(18)} color={figmaColors.charcoal} />
                <Text style={styles.secondaryBtnText}>{databaseCopy.authenticateSimilar}</Text>
              </Pressable>
            </View>

            <Text style={styles.sectionTitle}>{databaseCopy.cardInfo}</Text>
            <View style={styles.detailsCard}>
              <DetailRow label={databaseCopy.player} value={card.player_name} styles={styles} />
              <DetailRow label={databaseCopy.team} value={card.team_name} styles={styles} />
              <DetailRow label={databaseCopy.year} value={card.year ? String(card.year) : null} styles={styles} />
              <DetailRow label={databaseCopy.sport} value={card.sport_name} styles={styles} />
              <DetailRow label={databaseCopy.manufacturer} value={card.manufacturer_name} styles={styles} />
              <DetailRow
                label={databaseCopy.product}
                value={card.product_full_name ?? card.product_name}
                styles={styles}
              />
              <DetailRow label={databaseCopy.cardNumber} value={card.card_number} styles={styles} />
              <DetailRow label={databaseCopy.memorabilia} value={card.memorabilia_type} styles={styles} />
              <DetailRow
                label={databaseCopy.status}
                value={databaseCopy.authCount(card.authenticated_count)}
                styles={styles}
              />
            </View>

            <Text style={styles.sectionTitle}>{databaseCopy.authenticatedCopies}</Text>
            {assets.length === 0 ? (
              <Text style={styles.empty}>{databaseCopy.noAuthenticatedCopies}</Text>
            ) : (
              assets.map((asset) => (
                <Pressable
                  key={asset.id}
                  style={styles.assetRow}
                  onPress={() => openVerification(asset)}
                >
                  <View>
                    <Text style={styles.assetId}>
                      {databaseCopy.assetId}: {asset.asset_id}
                    </Text>
                    <Text style={styles.assetDate}>
                      {asset.authenticated_at
                        ? new Date(asset.authenticated_at).toLocaleDateString()
                        : '—'}
                    </Text>
                  </View>
                  <Text style={styles.assetLink}>{databaseCopy.viewVerification}</Text>
                </Pressable>
              ))
            )}
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(s: (n: number) => number, t: (n: number) => number) {
  const tb = (n: number) => bodyText(t, n);

  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: figmaColors.background },
    content: { paddingHorizontal: s(16), paddingBottom: s(32) },
    backRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(8),
      marginBottom: s(16),
      paddingVertical: s(4)
    },
    backText: {
      fontFamily: appFonts.accent,
      fontSize: tb(16),
      color: figmaColors.charcoal,
      ...broadsheetAccent,
      letterSpacing: 0.8
    },
    loader: { marginVertical: s(20) },
    error: {
      fontFamily: appFonts.body,
      fontSize: tb(15),
      color: figmaColors.error,
      marginBottom: s(12)
    },
    cardTitle: {
      fontFamily: appFonts.accent,
      fontSize: tb(20),
      lineHeight: tb(27),
      color: figmaColors.charcoal
    },
    cardSubtitle: {
      marginTop: s(6),
      fontFamily: appFonts.body,
      fontSize: tb(16),
      color: figmaColors.gray
    },
    tagRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: s(8),
      marginTop: s(12),
      marginBottom: s(16)
    },
    tag: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(4),
      backgroundColor: figmaColors.tagBg,
      borderWidth: 1,
      borderColor: figmaColors.tagBorder,
      borderRadius: s(8),
      paddingHorizontal: s(10),
      paddingVertical: s(6)
    },
    tagAuth: { borderColor: figmaColors.success, backgroundColor: figmaColors.successBg },
    tagText: {
      fontFamily: appFonts.body,
      fontSize: tb(11),
      color: figmaColors.gray
    },
    tagAuthText: { color: figmaColors.success },
    actions: { gap: s(10), marginBottom: s(22) },
    secondaryBtn: {
      minHeight: s(48),
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      borderRadius: s(12),
      backgroundColor: figmaColors.cream,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: s(8)
    },
    secondaryBtnText: {
      fontFamily: appFonts.accent,
      fontSize: tb(16),
      color: figmaColors.charcoal,
      ...broadsheetAccent,
      letterSpacing: 0.8
    },
    sectionTitle: {
      fontFamily: appFonts.display,
      fontSize: t(26),
      color: figmaColors.charcoal,
      marginBottom: s(12)
    },
    detailsCard: {
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      borderRadius: s(12),
      padding: s(16),
      marginBottom: s(20),
      backgroundColor: figmaColors.cream
    },
    detailRow: { marginBottom: s(12) },
    detailLabel: {
      fontFamily: appFonts.accent,
      fontSize: tb(11),
      color: figmaColors.gray,
      marginBottom: s(4),
      ...broadsheetAccent,
      letterSpacing: 0.8
    },
    detailValue: {
      fontFamily: appFonts.body,
      fontSize: tb(17),
      lineHeight: tb(24),
      color: figmaColors.charcoal
    },
    empty: {
      fontFamily: appFonts.body,
      fontSize: tb(17),
      color: figmaColors.gray
    },
    assetRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      borderRadius: s(10),
      padding: s(14),
      marginBottom: s(8),
      backgroundColor: figmaColors.cream
    },
    assetId: {
      fontFamily: appFonts.body,
      fontSize: tb(17),
      color: figmaColors.charcoal
    },
    assetDate: {
      fontFamily: appFonts.body,
      fontSize: tb(15),
      color: figmaColors.gray,
      marginTop: s(4)
    },
    assetLink: {
      fontFamily: appFonts.body,
      fontSize: tb(15),
      color: figmaColors.bronze
    }
  });
}
