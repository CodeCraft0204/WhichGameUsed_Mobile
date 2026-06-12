import { Ionicons } from '@expo/vector-icons';
import { appFonts } from '@/constants/appFonts';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
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
import { ProfileSubpageHeader } from '@/components/profile/ProfileSubpageHeader';
import { databaseCopy } from '@/constants/databaseCopy';
import { figmaColors } from '@/constants/figmaColors';
import { databaseCardHref, databaseWishlistAddHref } from '@/constants/navigation';
import { useAuth } from '@/context/AuthContext';
import { useFigmaLayout } from '@/hooks/useFigmaLayout';
import { listMyWishlist, removeWishlistItem, wishlistItemTitle, type WishlistItemRow } from '@/lib/wishlist';

export default function WishlistScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { s, t } = useFigmaLayout();
  const styles = useMemo(() => createStyles(s, t), [s, t]);
  const [items, setItems] = useState<WishlistItemRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(() => {
    if (!user) {
      setItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    void listMyWishlist().then(({ items: rows, error: err }) => {
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

  const openItem = (item: WishlistItemRow) => {
    if (item.card_id) {
      router.push(databaseCardHref(item.card_id));
    }
  };

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
          items.map((item) => (
            <Pressable
              key={item.id}
              style={styles.row}
              onPress={() => openItem(item)}
              disabled={!item.card_id}
            >
              <View style={styles.rowBody}>
                <Text style={styles.rowTitle}>{wishlistItemTitle(item)}</Text>
                <Text style={styles.rowMeta}>
                  {item.card_id ? 'In catalog' : 'Requested — pending review'}
                </Text>
              </View>
              <Pressable onPress={() => void removeItem(item.id)} hitSlop={12}>
                <Ionicons name="close-circle-outline" size={s(22)} color={figmaColors.gray} />
              </Pressable>
            </Pressable>
          ))
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
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(12),
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      borderRadius: s(12),
      padding: s(14),
      marginBottom: s(10),
      backgroundColor: figmaColors.cream
    },
    rowBody: { flex: 1, gap: s(4) },
    rowTitle: {
      fontFamily: appFonts.body,
      fontSize: t(18),
      color: figmaColors.charcoal
    },
    rowMeta: {
      fontFamily: appFonts.body,
      fontSize: t(14),
      color: figmaColors.gray
    }
  });
}
