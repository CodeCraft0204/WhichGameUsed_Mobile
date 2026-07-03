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
import { ProfileAvatar } from '@/components/profile/ProfileAvatar';
import { ProfileSubpageHeader } from '@/components/profile/ProfileSubpageHeader';
import { appFonts } from '@/constants/appFonts';
import { bodyText } from '@/constants/appTypography';
import { figmaColors } from '@/constants/figmaColors';
import {
  messageConversationHref,
  publicProfileHref
} from '@/constants/navigation';
import { socialCopy } from '@/constants/socialCopy';
import { useAuth } from '@/context/AuthContext';
import { useFigmaLayout } from '@/hooks/useFigmaLayout';
import {
  listSocialNotifications,
  markAllSocialNotificationsRead,
  type SocialNotification
} from '@/lib/social';

export default function SocialNotificationsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { s, t } = useFigmaLayout(1);
  const page = useMemo(() => createFigmaPageStyles(s, t), [s, t]);
  const styles = useMemo(() => createLocalStyles(s, t), [s, t]);
  const [items, setItems] = useState<SocialNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async (isRefresh = false) => {
    if (!user) return;
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    const { items: rows } = await listSocialNotifications();
    setItems(rows);
    setLoading(false);
    setRefreshing(false);
  }, [user]);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  const openNotification = async (row: SocialNotification) => {
    if (row.type === 'new_message' && row.conversationId) {
      router.push(messageConversationHref(row.conversationId));
      return;
    }
    if (row.actorId) router.push(publicProfileHref(row.actorId));
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
        onPress={() => void markAllSocialNotificationsRead().then(() => load(true))}
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
            style={[styles.row, !row.readAt && styles.unread]}
            accessibilityRole="button"
          >
            <ProfileAvatar
              url={row.actorAvatarUrl}
              name={row.actorDisplayName ?? 'Collector'}
              size={s(40)}
            />
            <View style={styles.textCol}>
              <Text style={styles.body}>
                <Text style={styles.name}>{row.actorDisplayName ?? 'Someone'}</Text>{' '}
                {row.type === 'new_follower'
                  ? socialCopy.notifications.newFollower
                  : socialCopy.notifications.newMessage}
              </Text>
              <Text style={styles.when}>
                {new Date(row.createdAt).toLocaleString(undefined, {
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
      flexDirection: 'row',
      gap: s(12),
      paddingVertical: s(12),
      borderBottomWidth: 1,
      borderBottomColor: figmaColors.divider
    },
    unread: { backgroundColor: figmaColors.cream },
    textCol: { flex: 1, gap: s(4) },
    body: {
      fontFamily: appFonts.body,
      fontSize: tb(16),
      color: figmaColors.charcoal,
      lineHeight: tb(22)
    },
    name: { fontFamily: appFonts.bodyBold },
    when: {
      fontFamily: appFonts.body,
      fontSize: tb(13),
      color: figmaColors.gray
    }
  });
}
