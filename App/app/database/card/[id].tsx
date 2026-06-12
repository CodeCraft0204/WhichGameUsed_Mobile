import * as Linking from 'expo-linking';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ProfileSubpageHeader } from '@/components/profile/ProfileSubpageHeader';
import { databaseIcons } from '@/constants/databaseContent';
import { databaseCopy } from '@/constants/databaseCopy';
import { figmaColors } from '@/constants/figmaColors';
import { useFigmaLayout } from '@/hooks/useFigmaLayout';
import {
  getCardById,
  listAuthenticatedAssetsForCard,
  type AuthenticatedAssetSummary,
  type CardSummary
} from '@/lib/cards';
import { absolutePortalUrl } from '@/lib/portal-url';

function DetailRow({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value?.trim()) return null;
  return (
    <View style={{ marginBottom: 8 }}>
      <Text style={{ fontFamily: 'Inter_700Bold', fontSize: 12, color: figmaColors.gray }}>{label}</Text>
      <Text style={{ fontFamily: 'EBGaramond_600SemiBold', fontSize: 18, color: figmaColors.charcoal }}>
        {value}
      </Text>
    </View>
  );
}

export default function CardDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { s, t } = useFigmaLayout(1);
  const styles = useMemo(() => createStyles(s, t), [s, t]);

  const [card, setCard] = useState<CardSummary | null>(null);
  const [assets, setAssets] = useState<AuthenticatedAssetSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id || typeof id !== 'string') return;
    let active = true;
    setLoading(true);
    void Promise.all([getCardById(id), listAuthenticatedAssetsForCard(id)]).then(
      ([cardResult, assetsResult]) => {
        if (!active) return;
        setCard(cardResult.card);
        setAssets(assetsResult.items);
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

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <ProfileSubpageHeader
          title="CARD"
          subtitle={card?.title ?? 'Loading…'}
          s={s}
          t={t}
          onBack={() => router.back()}
        />

        {loading ? <ActivityIndicator color={figmaColors.charcoal} /> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}

        {card ? (
          <>
            <Image
              source={card.imageUrl ? { uri: card.imageUrl } : databaseIcons.recordMantle}
              style={styles.heroImage}
              resizeMode="contain"
            />

            <View style={styles.detailsCard}>
              <DetailRow label={databaseCopy.player} value={card.player_name} />
              <DetailRow label={databaseCopy.team} value={card.team_name} />
              <DetailRow label={databaseCopy.year} value={card.year ? String(card.year) : null} />
              <DetailRow label={databaseCopy.sport} value={card.sport_name} />
              <DetailRow label={databaseCopy.manufacturer} value={card.manufacturer_name} />
              <DetailRow label={databaseCopy.product} value={card.product_full_name ?? card.product_name} />
              <DetailRow label={databaseCopy.cardNumber} value={card.card_number} />
              <DetailRow label={databaseCopy.memorabilia} value={card.memorabilia_type} />
              <DetailRow
                label={databaseCopy.status}
                value={databaseCopy.authCount(card.authenticated_count)}
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
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: figmaColors.background },
    content: { paddingHorizontal: s(16), paddingBottom: s(32) },
    error: {
      fontFamily: 'EBGaramond_400Regular',
      fontSize: t(14),
      color: figmaColors.error,
      marginBottom: s(12)
    },
    heroImage: {
      width: '100%',
      height: s(280),
      marginBottom: s(16),
      borderRadius: s(12),
      backgroundColor: figmaColors.divider
    },
    detailsCard: {
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      borderRadius: s(12),
      padding: s(16),
      marginBottom: s(20),
      backgroundColor: figmaColors.cream
    },
    sectionTitle: {
      fontFamily: 'EBGaramond_700Bold',
      fontSize: t(20),
      color: figmaColors.charcoal,
      marginBottom: s(12)
    },
    empty: {
      fontFamily: 'EBGaramond_400Regular',
      fontSize: t(16),
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
      fontFamily: 'EBGaramond_700Bold',
      fontSize: t(16),
      color: figmaColors.charcoal
    },
    assetDate: {
      fontFamily: 'EBGaramond_400Regular',
      fontSize: t(14),
      color: figmaColors.gray,
      marginTop: s(4)
    },
    assetLink: {
      fontFamily: 'EBGaramond_600SemiBold',
      fontSize: t(14),
      color: figmaColors.bronze
    }
  });
}
