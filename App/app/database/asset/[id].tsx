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
import { CardImagePager } from '@/components/database/CardImagePager';
import { ProfileSubpageHeader } from '@/components/profile/ProfileSubpageHeader';
import { AuthPrimaryButton } from '@/components/auth/AuthPrimaryButton';
import { databaseIcons } from '@/constants/databaseContent';
import { appFonts } from '@/constants/appFonts';
import { databaseCopy } from '@/constants/databaseCopy';
import { figmaColors } from '@/constants/figmaColors';
import { databaseCardHref, databaseVerificationHref } from '@/constants/navigation';
import { useFigmaLayout } from '@/hooks/useFigmaLayout';
import {
  getAuthenticatedAssetById,
  getCardById,
  type CardDetail
} from '@/lib/cards';
import { getCurrentStickerStatusForAsset, stickerStatusLabel } from '@/lib/verification';

export default function AuthenticatedAssetScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { s, t } = useFigmaLayout();
  const styles = useMemo(() => createStyles(s, t), [s, t]);
  const [card, setCard] = useState<CardDetail | null>(null);
  const [assetId, setAssetId] = useState('');
  const [authenticatedAt, setAuthenticatedAt] = useState<string | null>(null);
  const [stickerStatus, setStickerStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id || typeof id !== 'string') return;
    let active = true;
    setLoading(true);
    void (async () => {
      const assetRes = await getAuthenticatedAssetById(id);
      if (!active) return;
      if (assetRes.error || !assetRes.asset) {
        setError(assetRes.error ?? 'Asset not found.');
        setLoading(false);
        return;
      }
      const asset = assetRes.asset;
      setAssetId(asset.asset_id);
      setAuthenticatedAt(asset.authenticated_at);
      const [cardRes, stickerRes] = await Promise.all([
        getCardById(asset.card_id),
        getCurrentStickerStatusForAsset(asset.id)
      ]);
      if (!active) return;
      setCard(cardRes.card);
      setStickerStatus(stickerRes.status);
      setError(cardRes.error ?? stickerRes.error);
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [id]);

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
            </View>
            <AuthPrimaryButton
              label={databaseCopy.viewCatalogCard}
              onPress={() => router.push(databaseCardHref(card.id))}
            />
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
