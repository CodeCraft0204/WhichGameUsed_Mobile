import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { Image, ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native';
import { appFonts } from '@/constants/appFonts';
import { bodyText } from '@/constants/appTypography';
import { databaseIcons } from '@/constants/databaseContent';
import { figmaIcons } from '@/constants/figmaIcons';
import { figmaColors } from '@/constants/figmaColors';
import {
  dismissAnnouncement,
  getActiveAnnouncement,
  type AppAnnouncement
} from '@/lib/announcements';
import { useFigmaLayout } from '@/hooks/useFigmaLayout';

/** Split portal message into subtitle + bold title (newline, pipe, or auto tail). */
export function parseAnnouncementMessage(message: string): { subtitle: string; title: string } {
  const trimmed = message.trim();
  if (!trimmed) return { subtitle: '', title: '' };

  if (trimmed.includes('\n')) {
    const [subtitle, ...rest] = trimmed.split('\n');
    return { subtitle: subtitle.trim(), title: rest.join('\n').trim() };
  }

  if (trimmed.includes('|')) {
    const [subtitle, title] = trimmed.split('|');
    return { subtitle: subtitle.trim(), title: title.trim() };
  }

  const words = trimmed.split(/\s+/);
  if (words.length >= 4) {
    const titleWords = words.slice(-2);
    const subtitleWords = words.slice(0, -2);
    const titleCandidate = titleWords.join(' ');
    if (/^[A-Z]/.test(titleCandidate)) {
      return { subtitle: subtitleWords.join(' '), title: titleCandidate };
    }
  }

  return { subtitle: '', title: trimmed };
}

export function AppAnnouncementBanner() {
  const router = useRouter();
  const { s, t } = useFigmaLayout();
  const styles = useMemo(() => createStyles(s, t), [s, t]);
  const [announcement, setAnnouncement] = useState<AppAnnouncement | null>(null);

  useEffect(() => {
    void getActiveAnnouncement().then(({ announcement: row }) => setAnnouncement(row));
  }, []);

  if (!announcement) return null;

  const parsed = parseAnnouncementMessage(announcement.message);
  const subtitle = announcement.subtitle?.trim() || parsed.subtitle;
  const title = announcement.title?.trim() || parsed.title;

  const onPress = () => {
    if (!announcement.link_path) return;
    router.push(announcement.link_path as import('expo-router').Href);
  };

  const onDismiss = () => {
    void dismissAnnouncement(announcement.id);
    setAnnouncement(null);
  };

  return (
    <View style={styles.outer}>
      <ImageBackground
        source={databaseIcons.announcementBanner}
        style={styles.banner}
        imageStyle={styles.bannerImage}
        resizeMode="stretch"
      >
        <Pressable
          style={styles.content}
          onPress={announcement.link_path ? onPress : undefined}
          accessibilityRole="button"
          accessibilityLabel={announcement.message}
        >
          <Image source={figmaIcons.megaphone} style={styles.megaphone} resizeMode="contain" />

          <View style={styles.textCol}>
          <View style={styles.titleRow}>
              <Text style={styles.title} numberOfLines={2}>
                {title}
              </Text>
              {announcement.link_path ? (
                <Image
                  source={databaseIcons.sectionChevron}
                  style={styles.chevron}
                  resizeMode="contain"
                />
              ) : null}
            </View>
            {subtitle ? (
              <Text style={styles.subtitle} numberOfLines={1}>
                {subtitle}
              </Text>
            ) : null}
            
          </View>
        </Pressable>

        <Pressable
          onPress={onDismiss}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Dismiss announcement"
          style={styles.closeBtn}
        >
          <Text style={styles.closeText}>×</Text>
        </Pressable>
      </ImageBackground>
    </View>
  );
}

function createStyles(s: (n: number) => number, t: (n: number) => number) {
  const tb = (n: number) => bodyText(t, n);

  return StyleSheet.create({
    outer: {
      width: '100%',
      alignSelf: 'stretch',
      marginBottom: s(6)
    },
    banner: {
      width: '100%',
      minHeight: s(90),
      justifyContent: 'center'
    },
    bannerImage: {
      width: '100%',
      resizeMode: 'stretch'
    },
    content: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      paddingLeft: s(10),
      paddingRight: s(36),
      paddingVertical: s(14),
      gap: s(8)
    },
    megaphone: {
      width: s(40),
      height: s(40),
      flexShrink: 0,
      margin: s(20)
    },
    textCol: {
      flex: 1,
      minWidth: 0,
      justifyContent: 'center',
      gap: s(2)
    },
    subtitle: {
      fontFamily: appFonts.body,
      fontSize: tb(14),
      lineHeight: tb(18),
      color: figmaColors.gray
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(6)
    },
    title: {
      flex: 1,
      fontFamily: appFonts.display,
      fontSize: t(20),
      lineHeight: t(24),
      color: figmaColors.charcoal,
      letterSpacing: 0.2
    },
    chevron: {
      width: s(10),
      height: s(17),
      flexShrink: 0,
      marginTop: s(2)
    },
    closeBtn: {
      position: 'absolute',
      top: s(8),
      right: s(10),
      width: s(28),
      height: s(28),
      alignItems: 'center',
      justifyContent: 'center'
    },
    closeText: {
      fontFamily: appFonts.body,
      fontSize: t(22),
      lineHeight: t(22),
      color: figmaColors.gray,
      marginTop: -s(2)
    }
  });
}
