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
import { appFonts } from '@/constants/appFonts';
import { databaseCopy } from '@/constants/databaseCopy';
import { figmaColors } from '@/constants/figmaColors';
import { databaseCardHref } from '@/constants/navigation';
import { hrefFromNotificationLink } from '@/lib/notification-navigation';
import { useFigmaLayout } from '@/hooks/useFigmaLayout';
import {
  listMyNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  type UserNotification
} from '@/lib/notifications';

export default function NotificationsScreen() {
  const router = useRouter();
  const { s, t } = useFigmaLayout();
  const styles = useMemo(() => createStyles(s, t), [s, t]);
  const [items, setItems] = useState<UserNotification[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(() => {
    setLoading(true);
    void listMyNotifications().then(({ items: rows }) => {
      setItems(rows);
      setLoading(false);
    });
  }, []);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload])
  );

  const openItem = async (item: UserNotification) => {
    if (!item.read_at) await markNotificationRead(item.id);
    reload();
    const href = hrefFromNotificationLink(item.link_path);
    if (href) {
      router.push(href);
      return;
    }
    if (item.link_path?.startsWith('/database/card/')) {
      const cardId = item.link_path.replace('/database/card/', '');
      if (cardId) router.push(databaseCardHref(cardId));
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <ProfileSubpageHeader
          title={databaseCopy.notificationsTitle}
          s={s}
          t={t}
          onBack={() => router.back()}
        />
        {items.some((n) => !n.read_at) ? (
          <Pressable onPress={() => void markAllNotificationsRead().then(reload)}>
            <Text style={styles.markAll}>{databaseCopy.markAllRead}</Text>
          </Pressable>
        ) : null}
        {loading ? (
          <ActivityIndicator color={figmaColors.charcoal} />
        ) : items.length === 0 ? (
          <Text style={styles.empty}>{databaseCopy.notificationsEmpty}</Text>
        ) : (
          items.map((item) => (
            <Pressable key={item.id} style={styles.row} onPress={() => void openItem(item)}>
              <Text style={styles.title}>{item.title}</Text>
              {item.body ? <Text style={styles.body}>{item.body}</Text> : null}
              <Text style={styles.date}>{new Date(item.created_at).toLocaleString()}</Text>
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
    markAll: {
      fontFamily: appFonts.body,
      fontSize: t(15),
      color: figmaColors.bronze,
      marginBottom: s(12)
    },
    empty: {
      fontFamily: appFonts.body,
      fontSize: t(17),
      color: figmaColors.gray
    },
    row: {
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      borderRadius: s(12),
      padding: s(14),
      marginBottom: s(10),
      backgroundColor: figmaColors.cream,
      gap: s(4)
    },
    title: {
      fontFamily: appFonts.body,
      fontSize: t(17),
      color: figmaColors.charcoal
    },
    body: {
      fontFamily: appFonts.body,
      fontSize: t(15),
      color: figmaColors.gray
    },
    date: {
      fontFamily: appFonts.body,
      fontSize: t(13),
      color: figmaColors.textMuted
    }
  });
}
