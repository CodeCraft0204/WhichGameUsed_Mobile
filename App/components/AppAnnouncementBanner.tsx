import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { appFonts } from '@/constants/appFonts';
import { bodyText } from '@/constants/appTypography';
import { figmaColors } from '@/constants/figmaColors';
import {
  dismissAnnouncement,
  getActiveAnnouncement,
  type AppAnnouncement
} from '@/lib/announcements';
import { useFigmaLayout } from '@/hooks/useFigmaLayout';

export function AppAnnouncementBanner() {
  const router = useRouter();
  const { s, t } = useFigmaLayout();
  const styles = useMemo(() => createStyles(s, t), [s, t]);
  const [announcement, setAnnouncement] = useState<AppAnnouncement | null>(null);

  useEffect(() => {
    void getActiveAnnouncement().then(({ announcement: row }) => setAnnouncement(row));
  }, []);

  if (!announcement) return null;

  const onPress = () => {
    if (!announcement.link_path) return;
    router.push(announcement.link_path as import('expo-router').Href);
  };

  const onDismiss = () => {
    void dismissAnnouncement(announcement.id);
    setAnnouncement(null);
  };

  return (
    <View style={styles.wrap}>
      <Pressable
        style={styles.banner}
        onPress={announcement.link_path ? onPress : undefined}
        accessibilityRole="button"
        accessibilityLabel={announcement.message}
      >
        <Ionicons name="megaphone-outline" size={s(18)} color={figmaColors.bronze} />
        <Text style={styles.text} numberOfLines={2}>
          {announcement.message}
        </Text>
      </Pressable>
      <Pressable
        onPress={onDismiss}
        hitSlop={10}
        accessibilityRole="button"
        accessibilityLabel="Dismiss announcement"
        style={styles.closeBtn}
      >
        <Ionicons name="close" size={s(18)} color={figmaColors.gray} />
      </Pressable>
    </View>
  );
}

function createStyles(s: (n: number) => number, t: (n: number) => number) {
  const tb = (n: number) => bodyText(t, n);
  return StyleSheet.create({
    wrap: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(8),
      marginBottom: s(10),
      paddingHorizontal: s(4)
    },
    banner: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(8),
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      backgroundColor: figmaColors.utilityBar,
      borderRadius: s(12),
      paddingVertical: s(10),
      paddingHorizontal: s(12)
    },
    text: {
      flex: 1,
      fontFamily: appFonts.accent,
      fontSize: tb(15),
      lineHeight: tb(20),
      color: figmaColors.charcoal
    },
    closeBtn: {
      padding: s(4)
    }
  });
}
