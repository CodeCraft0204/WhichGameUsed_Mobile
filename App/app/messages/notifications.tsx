import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { FigmaScreen } from '@/components/figma/FigmaScreen';
import { createFigmaPageStyles } from '@/components/figma/figmaPageStyles';
import { ProfileSubpageHeader } from '@/components/profile/ProfileSubpageHeader';
import { appFonts } from '@/constants/appFonts';
import { bodyText } from '@/constants/appTypography';
import { figmaColors } from '@/constants/figmaColors';
import { socialCopy } from '@/constants/socialCopy';
import { useSocialNotifications } from '@/context/SocialNotificationsContext';
import { defaultHrefForNotification } from '@/lib/notification-navigation';
import {
  listMyNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type UserNotification
} from '@/lib/notifications';
import { useFigmaLayout } from '@/hooks/useFigmaLayout';
import { isSocialNotification } from '@/lib/notification-navigation';

export default function SocialNotificationsScreen() {
  const router = useRouter();
  const { refreshCounts } = useSocialNotifications();
  const { s, t } = useFigmaLayout(1);
  const page = useMemo(() => createFigmaPageStyles(s, t), [s, t]);
  const styles = useMemo(() => createLocalStyles(s, t), [s, t]);
  const [items, setItems] = useState<UserNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    const { items: rows } = await listMyNotifications(50);
    setItems(rows.filter(isSocialNotification));
    setLoading(false);
    setRefreshing(false);
    await refreshCounts();
  }, [refreshCounts]);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  const openNotification = async (row: UserNotification) => {
    if (!row.read_at) await markNotificationRead(row.id);
    await load(true);
    router.push(defaultHrefForNotification(row));
  };

  return (
    <FigmaScreen
      scrollProps={{
        contentContainerStyle: page.scrollContent,
        refreshControl: <RefreshControl refreshing={refreshing} onRefresh={() => void load(true)} />
      }}
    >
      <ProfileSubpageHeader
        title={socialCopy.notifications.title}
        subtitle={socialCopy.notifications.subtitle}
        s={s}
        t={t}
        onBack={() => router.back()}
      />

      <Pressable
        onPress={() => void markAllNotificationsRead().then(() => load(true))}
        style={styles.markAll}
        accessibilityRole="button"
      >
        <Text style={styles.markAllText}>{socialCopy.notifications.markAllRead}</Text>
      </Pressable>

      {loading && items.length === 0 ? (
        <ActivityIndicator size="large" color={figmaColors.charcoal} />
      ) : items.length === 0 ? (
        <Text style={styles.empty}>{socialCopy.notifications.empty}</Text>
      ) : (
        items.map((row) => (
          <Pressable
            key={row.id}
            onPress={() => void openNotification(row)}
            style={[styles.row, !row.read_at && styles.unread]}
            accessibilityRole="button"
          >
            <View style={styles.textCol}>
              <Text style={styles.title}>{row.title}</Text>
              {row.body ? <Text style={styles.body}>{row.body}</Text> : null}
              <Text style={styles.when}>
                {new Date(row.created_at).toLocaleString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit'
                })}
              </Text>
            </View>
          </Pressable>
        ))
      )}
    </FigmaScreen>
  );
}

function createLocalStyles(s: (n: number) => number, t: (n: number) => number) {
  const tb = (n: number) => bodyText(t, n);
  return StyleSheet.create({
    markAll: { marginBottom: s(12), alignSelf: 'flex-start' },
    markAllText: {
      fontFamily: appFonts.accent,
      fontSize: tb(13),
      color: figmaColors.navActive,
      letterSpacing: 0.4
    },
    empty: {
      fontFamily: appFonts.body,
      fontSize: tb(17),
      color: figmaColors.gray
    },
    row: {
      paddingVertical: s(12),
      borderBottomWidth: 1,
      borderBottomColor: figmaColors.divider
    },
    unread: { backgroundColor: figmaColors.cream },
    textCol: { gap: s(4) },
    title: {
      fontFamily: appFonts.bodyBold,
      fontSize: tb(16),
      color: figmaColors.charcoal
    },
    body: {
      fontFamily: appFonts.body,
      fontSize: tb(15),
      lineHeight: tb(21),
      color: figmaColors.gray
    },
    when: {
      fontFamily: appFonts.body,
      fontSize: tb(13),
      color: figmaColors.gray
    }
  });
}
