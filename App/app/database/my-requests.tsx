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
import { ProfileSubpageHeader } from '@/components/profile/ProfileSubpageHeader';
import { databaseCopy } from '@/constants/databaseCopy';
import { figmaColors } from '@/constants/figmaColors';
import {
  databaseCardHref,
  databaseRequestDetailHref,
  databaseWishlistAddHref
} from '@/constants/navigation';
import { useAuth } from '@/context/AuthContext';
import { useFigmaLayout } from '@/hooks/useFigmaLayout';
import { listMyCardRequests, type CardRequestRow } from '@/lib/card-requests';

function statusLabel(status: string): string {
  return status.replace(/_/g, ' ');
}

function requestTitle(row: CardRequestRow): string {
  return row.card_title?.trim() || row.player_name?.trim() || row.product_name?.trim() || 'Card request';
}

export default function MyRequestsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { s, t } = useFigmaLayout();
  const styles = useMemo(() => createStyles(s, t), [s, t]);
  const [items, setItems] = useState<CardRequestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(() => {
    if (!user) {
      setItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    void listMyCardRequests().then(({ items: rows, error: err }) => {
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

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <ProfileSubpageHeader
          title={databaseCopy.myRequestsTitle}
          s={s}
          t={t}
          onBack={() => router.back()}
        />

        {!user ? (
          <Text style={styles.muted}>{databaseCopy.requestSignIn}</Text>
        ) : loading ? (
          <ActivityIndicator color={figmaColors.charcoal} />
        ) : error ? (
          <Text style={styles.error}>{error}</Text>
        ) : items.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.muted}>{databaseCopy.myRequestsEmpty}</Text>
            <Pressable onPress={() => router.push(databaseWishlistAddHref())}>
              <Text style={styles.link}>{databaseCopy.requestAddLink}</Text>
            </Pressable>
          </View>
        ) : (
          items.map((item) => (
            <Pressable
              key={item.id}
              style={styles.row}
              onPress={() => {
                if (item.status === 'approved' && item.accepted_card_id) {
                  router.push(databaseCardHref(item.accepted_card_id));
                } else {
                  router.push(databaseRequestDetailHref(item.id));
                }
              }}
            >
              <View style={styles.rowBody}>
                <Text style={styles.rowTitle}>{requestTitle(item)}</Text>
                <Text style={styles.rowMeta}>{statusLabel(item.status)}</Text>
              </View>
              <Ionicons name="chevron-forward" size={s(18)} color={figmaColors.gray} />
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
    muted: {
      fontFamily: appFonts.body,
      fontSize: t(17),
      lineHeight: t(24),
      color: figmaColors.gray
    },
    error: {
      fontFamily: appFonts.body,
      fontSize: t(15),
      color: figmaColors.error
    },
    empty: { gap: s(12), marginTop: s(16) },
    link: {
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
      color: figmaColors.gray,
      textTransform: 'capitalize'
    }
  });
}
