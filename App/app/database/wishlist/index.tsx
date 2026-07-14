import { Ionicons } from '@expo/vector-icons';
import { appFonts } from '@/constants/appFonts';
import { useFocusEffect, useRouter } from 'expo-router';
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
import { databaseCopy } from '@/constants/databaseCopy';
import { figmaColors } from '@/constants/figmaColors';
import {
  databaseMyRequestsHref,
  databaseWishlistAddHref,
  databaseWishlistDetailHref
} from '@/constants/navigation';
import { useAuth } from '@/context/AuthContext';
import { useFigmaLayout } from '@/hooks/useFigmaLayout';
import {
  listMyWishlistEnriched,
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

function isPromoted(status: WishlistDisplayStatus): boolean {
  return status === 'promoted_to_most_wanted' || status === 'evidence_needed';
}

export default function WishlistScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { s, t } = useFigmaLayout();
  const styles = useMemo(() => createStyles(s, t), [s, t]);
  const [items, setItems] = useState<WishlistEnrichedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(() => {
    if (!user) {
      setItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    void listMyWishlistEnriched().then(({ items: rows, error: err }) => {
      setItems(rows);
      setError(err);
      setLoading(false);
    });
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload])
  );

  const removeItem = async (itemId: string) => {
    const { error: err } = await removeWishlistItem(itemId);
    if (!err) reload();
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <ProfileSubpageHeader
          title={databaseCopy.wishlistTitle}
          s={s}
          t={t}
          onBack={() => router.back()}
        />

        {user ? (
          <Pressable style={styles.requestsLink} onPress={() => router.push(databaseMyRequestsHref())}>
            <Text style={styles.requestsLinkText}>{databaseCopy.myRequestsTitle}</Text>
          </Pressable>
        ) : null}

        {!user ? (
          <View style={styles.signInCard}>
            <Text style={styles.signInText}>{databaseCopy.wishlistSignIn}</Text>
            <AuthPrimaryButton label="SIGN IN" onPress={() => router.replace('/sign-in/sign-in')} />
          </View>
        ) : loading ? (
          <ActivityIndicator color={figmaColors.charcoal} />
        ) : error ? (
          <Text style={styles.error}>{error}</Text>
        ) : items.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="heart-outline" size={s(40)} color={figmaColors.gray} />
            <Text style={styles.emptyText}>{databaseCopy.wishlistEmpty}</Text>
            <Pressable onPress={() => router.push(databaseWishlistAddHref())}>
              <Text style={styles.addLink}>{databaseCopy.requestAddLink}</Text>
            </Pressable>
          </View>
        ) : (
          <>
            {items.map((item) => (
              <Pressable
                key={item.id}
                style={styles.row}
                onPress={() => router.push(databaseWishlistDetailHref(item.id))}
              >
                <View style={styles.thumb}>
                  {item.imageUrl ? (
                    <Image source={{ uri: item.imageUrl }} style={styles.thumbImage} resizeMode="cover" />
                  ) : (
                    <Ionicons name="image-outline" size={s(22)} color={figmaColors.gray} />
                  )}
                </View>
                <View style={styles.rowBody}>
                  <Text style={styles.rowTitle} numberOfLines={2}>
                    {item.card_title}
                  </Text>
                  <View style={styles.badgeRow}>
                    <View style={styles.statusBadge}>
                      <Text style={styles.statusText}>{statusLabel(item.display_status)}</Text>
                    </View>
                    {isPromoted(item.display_status) ? (
                      <View style={styles.mwBadge}>
                        <Text style={styles.mwBadgeText}>{databaseCopy.wishlistMostWantedBadge}</Text>
                      </View>
                    ) : null}
                  </View>
                </View>
                <Pressable onPress={() => void removeItem(item.id)} hitSlop={12}>
                  <Ionicons name="close-circle-outline" size={s(22)} color={figmaColors.gray} />
                </Pressable>
              </Pressable>
            ))}
            <Pressable style={styles.addFooter} onPress={() => router.push(databaseWishlistAddHref())}>
              <Text style={styles.addLink}>{databaseCopy.requestAddLink}</Text>
            </Pressable>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(s: (n: number) => number, t: (n: number) => number) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: figmaColors.background },
    content: { paddingHorizontal: s(16), paddingBottom: s(32) },
    signInCard: { gap: s(16), marginTop: s(8) },
    signInText: {
      fontFamily: appFonts.body,
      fontSize: t(18),
      lineHeight: t(26),
      color: figmaColors.gray
    },
    error: {
      fontFamily: appFonts.body,
      fontSize: t(15),
      color: figmaColors.error
    },
    emptyCard: {
      alignItems: 'center',
      gap: s(14),
      marginTop: s(32),
      paddingHorizontal: s(12)
    },
    emptyText: {
      fontFamily: appFonts.body,
      fontSize: t(18),
      lineHeight: t(26),
      color: figmaColors.gray,
      textAlign: 'center'
    },
    addLink: {
      fontFamily: appFonts.body,
      fontSize: t(17),
      color: figmaColors.bronze
    },
    addFooter: {
      alignItems: 'center',
      paddingVertical: s(16)
    },
    requestsLink: {
      marginBottom: s(12)
    },
    requestsLinkText: {
      fontFamily: appFonts.body,
      fontSize: t(16),
      color: figmaColors.bronze
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(12),
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      borderRadius: s(12),
      padding: s(12),
      marginBottom: s(10),
      backgroundColor: figmaColors.cream
    },
    thumb: {
      width: s(52),
      height: s(64),
      borderRadius: s(8),
      backgroundColor: figmaColors.assetPreviewBg,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: figmaColors.borderLight
    },
    thumbImage: { width: '100%', height: '100%' },
    rowBody: { flex: 1, gap: s(6) },
    rowTitle: {
      fontFamily: appFonts.body,
      fontSize: t(17),
      color: figmaColors.charcoal
    },
    badgeRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: s(6)
    },
    statusBadge: {
      backgroundColor: figmaColors.tagBg,
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      borderRadius: s(8),
      paddingHorizontal: s(8),
      paddingVertical: s(3)
    },
    statusText: {
      fontFamily: appFonts.accent,
      fontSize: t(10),
      letterSpacing: 0.3,
      color: figmaColors.charcoal
    },
    mwBadge: {
      backgroundColor: figmaColors.surfaceHighlight,
      borderWidth: 1,
      borderColor: figmaColors.accent,
      borderRadius: s(8),
      paddingHorizontal: s(8),
      paddingVertical: s(3)
    },
    mwBadgeText: {
      fontFamily: appFonts.accent,
      fontSize: t(10),
      letterSpacing: 0.3,
      color: figmaColors.accentStrong
    }
  });
}
