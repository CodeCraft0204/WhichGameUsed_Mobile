import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { appFonts } from '@/constants/appFonts';
import { bodyText } from '@/constants/appTypography';
import { figmaColors } from '@/constants/figmaColors';
import { useSocialNotifications } from '@/context/SocialNotificationsContext';
import { defaultHrefForNotification } from '@/lib/notification-navigation';
import { markNotificationRead } from '@/lib/notifications';
import { useFigmaLayout } from '@/hooks/useFigmaLayout';

export function SocialNotificationBanner() {
  const router = useRouter();
  const { latestAlert, dismissLatestAlert, refreshCounts, applyUnreadNotificationDelta } =
    useSocialNotifications();
  const { s, t } = useFigmaLayout();
  const styles = useMemo(() => createStyles(s, t), [s, t]);

  if (!latestAlert) return null;

  const openAlert = async () => {
    const alert = latestAlert;
    dismissLatestAlert();
    if (!alert.read_at) {
      applyUnreadNotificationDelta(-1);
      const { error } = await markNotificationRead(alert.id);
      if (error) applyUnreadNotificationDelta(1);
      await refreshCounts();
    }
    router.push(defaultHrefForNotification(alert));
  };

  return (
    <View style={styles.wrap} pointerEvents="box-none">
      <Pressable style={styles.card} onPress={() => void openAlert()} accessibilityRole="button">
        <View style={styles.textCol}>
          <Text style={styles.title}>{latestAlert.title}</Text>
          {latestAlert.body ? (
            <Text style={styles.body} numberOfLines={2}>
              {latestAlert.body}
            </Text>
          ) : null}
        </View>
        <Pressable
          onPress={dismissLatestAlert}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Dismiss notification"
        >
          <Text style={styles.dismiss}>✕</Text>
        </Pressable>
      </Pressable>
    </View>
  );
}

function createStyles(s: (n: number) => number, t: (n: number) => number) {
  const tb = (n: number) => bodyText(t, n);
  return StyleSheet.create({
    wrap: {
      position: 'absolute',
      top: s(8),
      left: s(12),
      right: s(12),
      zIndex: 100
    },
    card: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: s(10),
      borderRadius: s(14),
      borderWidth: 1,
      borderColor: figmaColors.borderStrong,
      backgroundColor: figmaColors.cream,
      paddingHorizontal: s(14),
      paddingVertical: s(12),
      shadowColor: '#000',
      shadowOpacity: 0.12,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 3 },
      elevation: 4
    },
    textCol: { flex: 1, gap: s(2) },
    title: {
      fontFamily: appFonts.bodyBold,
      fontSize: tb(16),
      color: figmaColors.charcoal
    },
    body: {
      fontFamily: appFonts.body,
      fontSize: tb(14),
      lineHeight: tb(20),
      color: figmaColors.gray
    },
    dismiss: {
      fontFamily: appFonts.bodyBold,
      fontSize: tb(16),
      color: figmaColors.gray,
      paddingTop: s(2)
    }
  });
}
