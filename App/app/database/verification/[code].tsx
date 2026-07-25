import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthPrimaryButton } from '@/components/auth/AuthPrimaryButton';
import { CardImagePager } from '@/components/database/CardImagePager';
import { ProfileSubpageHeader } from '@/components/profile/ProfileSubpageHeader';
import { appFonts } from '@/constants/appFonts';
import { databaseIcons } from '@/constants/databaseContent';
import { databaseCopy } from '@/constants/databaseCopy';
import { figmaColors } from '@/constants/figmaColors';
import { databaseCardHref } from '@/constants/navigation';
import { useFigmaLayout } from '@/hooks/useFigmaLayout';
import { lookupAssetByCode, authStatusLabel, stickerStatusLabel, type VerifiedAsset } from '@/lib/verification';

function fileKindLabel(kind: string): string {
  return kind.replace(/_/g, ' ');
}

export default function VerificationScreen() {
  const router = useRouter();
  const { code } = useLocalSearchParams<{ code: string }>();
  const { s, t } = useFigmaLayout();
  const styles = useMemo(() => createStyles(s, t), [s, t]);
  const [asset, setAsset] = useState<VerifiedAsset | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!code || typeof code !== 'string') return;
    let active = true;
    setLoading(true);
    setError(null);
    void (async () => {
      const res = await lookupAssetByCode(code);
      if (!active) return;
      if (res.error) {
        setError(res.error);
        setAsset(null);
      } else if (!res.asset) {
        setError(databaseCopy.verificationNotFound);
        setAsset(null);
      } else {
        setAsset(res.asset);
      }
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [code]);

  const cardMeta = asset?.card
    ? [asset.card.player_name, asset.card.product_name, asset.card.year]
        .filter(Boolean)
        .join(' · ')
    : '';

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <ProfileSubpageHeader
          title={databaseCopy.verificationTitle}
          subtitle={asset?.asset_id}
          s={s}
          t={t}
          onBack={() => router.back()}
        />

        {loading ? <ActivityIndicator color={figmaColors.charcoal} /> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}

        {asset ? (
          <>
            <View style={styles.identityCard}>
              <View style={styles.identityHeader}>
                <Text style={styles.assetId}>{asset.asset_id}</Text>
                <View style={styles.statusBadge}>
                  <Text style={styles.statusText}>{authStatusLabel(asset.status)}</Text>
                </View>
              </View>

              <Text style={styles.label}>{databaseCopy.authenticatedAt}</Text>
              <Text style={styles.value}>
                {asset.authenticated_at
                  ? new Date(asset.authenticated_at).toLocaleString()
                  : '—'}
              </Text>

              {asset.sticker ? (
                <>
                  <Text style={styles.label}>Sticker</Text>
                  <Text style={styles.value}>
                    {stickerStatusLabel(asset.sticker.sticker_status)}
                  </Text>
                </>
              ) : null}

              {asset.public_notes ? (
                <>
                  <Text style={styles.label}>{databaseCopy.verificationPublicNotes}</Text>
                  <Text style={styles.value}>{asset.public_notes}</Text>
                </>
              ) : null}
            </View>

            {asset.card ? (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>{databaseCopy.verificationCatalogSection}</Text>
                <Text style={styles.cardTitle}>{asset.card.title}</Text>
                {cardMeta ? <Text style={styles.cardMeta}>{cardMeta}</Text> : null}
                <CardImagePager
                  frontSource={
                    asset.card.imageUrl ? { uri: asset.card.imageUrl } : databaseIcons.recordMantle
                  }
                  backSource={
                    asset.card.backImageUrl
                      ? { uri: asset.card.backImageUrl }
                      : databaseIcons.recordJordan
                  }
                  hasFrontImage={Boolean(asset.card.imageUrl)}
                  hasBackImage={Boolean(asset.card.backImageUrl)}
                  s={s}
                  t={t}
                />
              </View>
            ) : null}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{databaseCopy.verificationCopyPhotosSection}</Text>
              <Text style={styles.sectionHint}>{databaseCopy.verificationCopyPhotosHint}</Text>
              {asset.copy_photos.length < 1 ? (
                <Text style={styles.emptyPhotos}>{databaseCopy.verificationCopyPhotosEmpty}</Text>
              ) : (
                <View style={styles.photoGrid}>
                  {asset.copy_photos.map((photo) => (
                    <View key={photo.id} style={styles.photoCell}>
                      <Text style={styles.photoLabel}>{fileKindLabel(photo.file_kind)}</Text>
                      {photo.url ? (
                        <Image source={{ uri: photo.url }} style={styles.photo} resizeMode="cover" />
                      ) : (
                        <View style={[styles.photo, styles.photoPlaceholder]}>
                          <ActivityIndicator color={figmaColors.bronze} />
                        </View>
                      )}
                    </View>
                  ))}
                </View>
              )}
            </View>

            {asset.card ? (
              <AuthPrimaryButton
                label={databaseCopy.viewCatalogCard}
                onPress={() => router.push(databaseCardHref(asset.card!.id))}
              />
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
      color: figmaColors.error,
      marginBottom: s(12)
    },
    identityCard: {
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      borderRadius: s(12),
      padding: s(16),
      marginBottom: s(20),
      backgroundColor: figmaColors.cream,
      gap: s(4)
    },
    identityHeader: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: s(10),
      marginBottom: s(12)
    },
    assetId: {
      fontFamily: appFonts.display,
      fontSize: t(28),
      lineHeight: t(34),
      color: figmaColors.charcoal,
      flexShrink: 1
    },
    statusBadge: {
      backgroundColor: figmaColors.borderLight,
      borderRadius: s(6),
      paddingHorizontal: s(10),
      paddingVertical: s(4)
    },
    statusText: {
      fontFamily: appFonts.body,
      fontSize: t(11),
      letterSpacing: 0.6,
      textTransform: 'uppercase',
      color: figmaColors.charcoal
    },
    label: {
      fontFamily: appFonts.body,
      fontSize: t(12),
      color: figmaColors.gray,
      marginTop: s(6)
    },
    value: {
      fontFamily: appFonts.body,
      fontSize: t(17),
      color: figmaColors.charcoal,
      marginBottom: s(4)
    },
    section: {
      marginBottom: s(24),
      gap: s(8)
    },
    sectionTitle: {
      fontFamily: appFonts.accent,
      fontSize: t(18),
      color: figmaColors.charcoal
    },
    sectionHint: {
      fontFamily: appFonts.body,
      fontSize: t(13),
      lineHeight: t(18),
      color: figmaColors.gray,
      marginBottom: s(4)
    },
    cardTitle: {
      fontFamily: appFonts.body,
      fontSize: t(17),
      color: figmaColors.charcoal
    },
    cardMeta: {
      fontFamily: appFonts.body,
      fontSize: t(14),
      color: figmaColors.gray,
      marginBottom: s(8)
    },
    emptyPhotos: {
      fontFamily: appFonts.body,
      fontSize: t(14),
      color: figmaColors.gray,
      marginTop: s(4)
    },
    photoGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: s(12),
      marginTop: s(8)
    },
    photoCell: {
      width: '47%',
      flexGrow: 1,
      gap: s(6)
    },
    photoLabel: {
      fontFamily: appFonts.body,
      fontSize: t(12),
      textTransform: 'capitalize',
      color: figmaColors.gray
    },
    photo: {
      width: '100%',
      aspectRatio: 3 / 4,
      borderRadius: s(8),
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      backgroundColor: figmaColors.cream
    },
    photoPlaceholder: {
      alignItems: 'center',
      justifyContent: 'center'
    }
  });
}
