import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
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
import { AuthPrimaryButton } from '@/components/auth/AuthPrimaryButton';
import { ProfileSubpageHeader } from '@/components/profile/ProfileSubpageHeader';
import { appFonts } from '@/constants/appFonts';
import { databaseCopy } from '@/constants/databaseCopy';
import { figmaColors } from '@/constants/figmaColors';
import {
  createWithLinkedCardHref,
  databaseCardHref,
  databaseWishlistHref,
  mostWantedDetailHref
} from '@/constants/navigation';
import { useFigmaLayout } from '@/hooks/useFigmaLayout';
import {
  getWishlistItemEnriched,
  removeWishlistItem,
  type WishlistDisplayStatus,
  type WishlistEnrichedItem
} from '@/lib/wishlist';

function statusLabel(status: WishlistDisplayStatus): string {
  switch (status) {
    case 'saved':
      return databaseCopy.wishlistStatusSaved;
    case 'requested':
      return databaseCopy.wishlistStatusRequested;
    case 'under_review':
      return databaseCopy.wishlistStatusUnderReview;
    case 'promoted_to_most_wanted':
      return databaseCopy.wishlistStatusPromoted;
    case 'evidence_needed':
      return databaseCopy.wishlistStatusEvidenceNeeded;
    case 'added_to_database':
      return databaseCopy.wishlistStatusAdded;
    default:
      return status;
  }
}

export default function WishlistDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { s, t } = useFigmaLayout();
  const styles = useMemo(() => createStyles(s, t), [s, t]);
  const [item, setItem] = useState<WishlistEnrichedItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const reload = useCallback(() => {
    if (!id) {
      setError('Item not found.');
      setLoading(false);
      return;
    }
    setLoading(true);
    void getWishlistItemEnriched(id).then(({ item: row, error: err }) => {
      setItem(row);
      setError(err ?? (row ? null : 'Item not found.'));
      setLoading(false);
    });
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload])
  );

  const handleRemove = async () => {
    if (!item) return;
    setBusy(true);
    const { error: err } = await removeWishlistItem(item.id);
    setBusy(false);
    if (err) {
      setError(err);
      return;
    }
    router.replace(databaseWishlistHref());
  };

  const catalogId = item?.catalog_card_id ?? null;
  const canAuth = !!catalogId;
  const canViewMw =
    !!item?.most_wanted_hunt_id &&
    (item.display_status === 'promoted_to_most_wanted' ||
      item.display_status === 'evidence_needed' ||
      item.most_wanted_status === 'solved');
  const canViewCard = !!catalogId;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <ProfileSubpageHeader
          title={databaseCopy.wishlistDetailTitle}
          s={s}
          t={t}
          onBack={() => router.back()}
        />

        {loading ? <ActivityIndicator color={figmaColors.charcoal} /> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}

        {!loading && item ? (
          <View style={styles.card}>
            <View style={styles.imageWrap}>
              {item.imageUrl ? (
                <Image source={{ uri: item.imageUrl }} style={styles.image} resizeMode="contain" />
              ) : (
                <Ionicons name="image-outline" size={s(40)} color={figmaColors.gray} />
              )}
            </View>

            <Text style={styles.title}>{item.card_title}</Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>{statusLabel(item.display_status)}</Text>
            </View>

            {[item.player_name, item.product_year, item.product_name].filter(Boolean).length > 0 ? (
              <Text style={styles.meta}>
                {[item.player_name, item.product_year, item.product_name].filter(Boolean).join(' · ')}
              </Text>
            ) : null}

            {item.review_notes?.trim() ? (
              <Text style={styles.notes}>Reviewer notes: {item.review_notes.trim()}</Text>
            ) : null}
            {item.notes?.trim() ? <Text style={styles.notes}>Your notes: {item.notes.trim()}</Text> : null}

            <View style={styles.actions}>
              {canAuth ? (
                <AuthPrimaryButton
                  label={databaseCopy.wishlistCtaAuthenticate}
                  onPress={() =>
                    router.push(createWithLinkedCardHref(catalogId!, item.card_title))
                  }
                />
              ) : null}
              {canViewMw && item.most_wanted_hunt_id ? (
                <Pressable
                  style={styles.secondaryBtn}
                  onPress={() => router.push(mostWantedDetailHref(item.most_wanted_hunt_id!))}
                >
                  <Text style={styles.secondaryText}>{databaseCopy.wishlistCtaViewMostWanted}</Text>
                </Pressable>
              ) : null}
              {canViewCard ? (
                <Pressable
                  style={styles.secondaryBtn}
                  onPress={() => router.push(databaseCardHref(catalogId!))}
                >
                  <Text style={styles.secondaryText}>{databaseCopy.wishlistCtaViewCard}</Text>
                </Pressable>
              ) : null}
              <Pressable
                style={styles.removeBtn}
                disabled={busy}
                onPress={() => void handleRemove()}
              >
                <Text style={styles.removeText}>{databaseCopy.wishlistCtaRemove}</Text>
              </Pressable>
            </View>
          </View>
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
      fontSize: t(15),
      color: figmaColors.error,
      marginBottom: s(12)
    },
    card: {
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      borderRadius: s(14),
      padding: s(16),
      backgroundColor: figmaColors.cream,
      gap: s(12)
    },
    imageWrap: {
      height: s(180),
      borderRadius: s(10),
      backgroundColor: figmaColors.assetPreviewBg,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: figmaColors.borderLight
    },
    image: { width: '100%', height: '100%' },
    title: {
      fontFamily: appFonts.bodyBold,
      fontSize: t(22),
      lineHeight: t(28),
      color: figmaColors.charcoal
    },
    statusBadge: {
      alignSelf: 'flex-start',
      backgroundColor: figmaColors.tagBg,
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      borderRadius: s(8),
      paddingHorizontal: s(10),
      paddingVertical: s(4)
    },
    statusText: {
      fontFamily: appFonts.accent,
      fontSize: t(11),
      letterSpacing: 0.4,
      color: figmaColors.charcoal
    },
    meta: {
      fontFamily: appFonts.body,
      fontSize: t(15),
      color: figmaColors.gray
    },
    notes: {
      fontFamily: appFonts.body,
      fontSize: t(14),
      lineHeight: t(20),
      color: figmaColors.brownMuted
    },
    actions: { gap: s(10), marginTop: s(4) },
    secondaryBtn: {
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      borderRadius: s(10),
      paddingVertical: s(12),
      alignItems: 'center',
      backgroundColor: figmaColors.surface
    },
    secondaryText: {
      fontFamily: appFonts.bodyBold,
      fontSize: t(13),
      letterSpacing: 0.4,
      color: figmaColors.charcoal
    },
    removeBtn: {
      paddingVertical: s(10),
      alignItems: 'center'
    },
    removeText: {
      fontFamily: appFonts.body,
      fontSize: t(14),
      color: figmaColors.error
    }
  });
}
