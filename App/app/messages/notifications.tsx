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
import { messagesInboxHref, safeGoBack } from '@/constants/navigation';
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

const PAGE_SIZE = 40;

function kindLabel(kind: string): string {
  return kind.replace(/_/g, ' ');
}

export default function NotificationsLogScreen() {
  const router = useRouter();
  const { refreshCounts } = useSocialNotifications();
  const { s, t } = useFigmaLayout(1);
  const page = useMemo(() => createFigmaPageStyles(s, t), [s, t]);
  const styles = useMemo(() => createLocalStyles(s, t), [s, t]);
  const [items, setItems] = useState<UserNotification[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(
    async (opts?: { refresh?: boolean; append?: boolean; offset?: number }) => {
      const isRefresh = opts?.refresh === true;
      const isAppend = opts?.append === true;
      const offset = isAppend ? (opts?.offset ?? 0) : 0;

      if (isAppend) setLoadingMore(true);
      else if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const { items: rows, hasMore: more } = await listMyNotifications(PAGE_SIZE, offset);

      setItems((prev) => (isAppend ? [...prev, ...rows] : rows));
      setHasMore(more);
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
      await refreshCounts();
    },
    [refreshCounts]
  );

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  const openNotification = async (row: UserNotification) => {
    if (!row.read_at) await markNotificationRead(row.id);
    await refreshCounts();
    setItems((prev) =>
      prev.map((item) =>
        item.id === row.id ? { ...item, read_at: item.read_at ?? new Date().toISOString() } : item
      )
    );
    router.push(defaultHrefForNotification(row));
  };

  const hasUnread = items.some((n) => !n.read_at);

  return (
    <FigmaScreen
      scrollProps={{
        contentContainerStyle: page.scrollContent,
        refreshControl: (
          <RefreshControl refreshing={refreshing} onRefresh={() => void load({ refresh: true })} />
        )
      }}
    >
      <ProfileSubpageHeader
        title={socialCopy.notifications.title}
        subtitle={socialCopy.notifications.subtitle}
        description={socialCopy.notifications.description}
        s={s}
        t={t}
        onBack={() => safeGoBack(messagesInboxHref())}
      />

      {hasUnread ? (
        <Pressable
          onPress={() =>
            void markAllNotificationsRead().then(() => load({ refresh: true }))
          }
          style={styles.markAll}
          accessibilityRole="button"
        >
          <Text style={styles.markAllText}>{socialCopy.notifications.markAllRead}</Text>
        </Pressable>
      ) : null}

      {loading && items.length === 0 ? (
        <ActivityIndicator size="large" color={figmaColors.charcoal} />
      ) : items.length === 0 ? (
        <Text style={styles.empty}>{socialCopy.notifications.empty}</Text>
      ) : (
        <>
          {items.map((row) => {
            const unread = !row.read_at;
            return (
              <Pressable
                key={row.id}
                onPress={() => void openNotification(row)}
                style={[styles.row, unread && styles.unread]}
                accessibilityRole="button"
              >
                <View style={styles.rowInner}>
                  {unread ? <View style={styles.unreadDot} /> : <View style={styles.readSpacer} />}
                  <View style={styles.textCol}>
                    <Text style={styles.kind}>{kindLabel(row.kind)}</Text>
                    <Text style={styles.title}>{row.title}</Text>
                    {row.body ? <Text style={styles.body}>{row.body}</Text> : null}
                    <Text style={styles.when}>
                      {new Date(row.created_at).toLocaleString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit'
                      })}
                    </Text>
                  </View>
                </View>
              </Pressable>
            );
          })}

          {hasMore ? (
            <Pressable
              style={styles.loadMore}
              onPress={() => void load({ append: true, offset: items.length })}
              disabled={loadingMore}
              accessibilityRole="button"
            >
              {loadingMore ? (
                <ActivityIndicator color={figmaColors.bronze} />
              ) : (
                <Text style={styles.loadMoreText}>{socialCopy.notifications.loadMore}</Text>
              )}
            </Pressable>
          ) : null}
        </>
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
    unread: {
      backgroundColor: figmaColors.cream,
      marginHorizontal: s(-8),
      paddingHorizontal: s(8),
      borderRadius: s(8)
    },
    rowInner: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: s(10)
    },
    unreadDot: {
      width: s(8),
      height: s(8),
      borderRadius: s(4),
      backgroundColor: figmaColors.error,
      marginTop: s(7)
    },
    readSpacer: {
      width: s(8),
      height: s(8),
      marginTop: s(7)
    },
    textCol: { flex: 1, gap: s(4) },
    kind: {
      fontFamily: appFonts.body,
      fontSize: tb(12),
      color: figmaColors.bronze,
      textTransform: 'capitalize',
      letterSpacing: 0.3
    },
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
    },
    loadMore: {
      marginTop: s(16),
      marginBottom: s(8),
      alignItems: 'center',
      paddingVertical: s(12)
    },
    loadMoreText: {
      fontFamily: appFonts.accent,
      fontSize: tb(14),
      color: figmaColors.bronze,
      letterSpacing: 0.4
    }
  });
}
