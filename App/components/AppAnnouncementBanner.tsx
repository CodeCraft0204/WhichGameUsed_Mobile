import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Image, ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native';
import { AnnouncementDetailModal } from '@/components/AnnouncementDetailModal';
import { AnnouncementMarquee } from '@/components/AnnouncementMarquee';
import { appFonts } from '@/constants/appFonts';
import { bodyText } from '@/constants/appTypography';
import { databaseIcons } from '@/constants/databaseContent';
import { figmaIcons } from '@/constants/figmaIcons';
import { figmaColors } from '@/constants/figmaColors';
import {
  getAnnouncementDisplay,
  listVisibleAnnouncements,
  type AppAnnouncement
} from '@/lib/announcements';
import { useFigmaLayout } from '@/hooks/useFigmaLayout';

type BannerCardProps = {
  announcements: AppAnnouncement[];
  onPress?: () => void;
  hidden?: boolean;
};

function AnnouncementBannerCard({ announcements, onPress, hidden = false }: BannerCardProps) {
  const { s, t } = useFigmaLayout();
  const styles = useMemo(() => createBannerStyles(s, t), [s, t]);
  const count = announcements.length;
  const first = count > 0 ? getAnnouncementDisplay(announcements[0]) : { title: '', content: '' };
  const titleMarquee = announcements
    .map((row) => getAnnouncementDisplay(row).title)
    .filter(Boolean)
    .join('   ·   ');
  const accessibilityText =
    count === 1
      ? [first.title, first.content].filter(Boolean).join('. ')
      : `${count} announcements. ${titleMarquee}`;

  return (
    <View style={[styles.outer, hidden && styles.outerHidden]} pointerEvents={hidden ? 'none' : 'auto'}>
      <ImageBackground
        source={databaseIcons.announcementBanner}
        style={styles.banner}
        imageStyle={styles.bannerImage}
        resizeMode="stretch"
      >
        <Pressable
          style={styles.content}
          onPress={onPress}
          accessibilityRole="button"
          accessibilityLabel={`Announcements. ${accessibilityText}`}
        >
          <Image source={figmaIcons.megaphone} style={styles.megaphone} resizeMode="contain" />

          <View style={styles.textCol}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>ANNOUNCEMENTS</Text>
              {count > 1 ? (
                <View style={styles.countBadge}>
                  <Text style={styles.countText}>{count}</Text>
                </View>
              ) : null}
            </View>

            {count === 1 ? (
              <>
                <Text style={styles.previewTitle} numberOfLines={1}>
                  {first.title}
                </Text>
                {first.content ? (
                  <Text style={styles.previewBody} numberOfLines={1}>
                    {first.content}
                  </Text>
                ) : null}
              </>
            ) : (
              <AnnouncementMarquee text={titleMarquee} />
            )}
          </View>
        </Pressable>
      </ImageBackground>
    </View>
  );
}

export function AppAnnouncementBanner() {
  const [announcements, setAnnouncements] = useState<AppAnnouncement[]>([]);
  const [modalVisible, setModalVisible] = useState(false);

  const reload = useCallback(async () => {
    const { announcements: rows } = await listVisibleAnnouncements();
    setAnnouncements(rows);
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const handleDismissed = useCallback((id: string) => {
    setAnnouncements((prev) => prev.filter((row) => row.id !== id));
  }, []);

  const handleClose = useCallback(() => {
    setModalVisible(false);
    void reload();
  }, [reload]);

  if (announcements.length === 0) return null;

  return (
    <>
      <AnnouncementBannerCard
        announcements={announcements}
        onPress={() => setModalVisible(true)}
        hidden={modalVisible}
      />

      <AnnouncementDetailModal
        visible={modalVisible}
        announcements={announcements}
        onClose={handleClose}
        onDismissed={handleDismissed}
      />
    </>
  );
}

function createBannerStyles(s: (n: number) => number, t: (n: number) => number) {
  const tb = (n: number) => bodyText(t, n);

  return StyleSheet.create({
    outer: {
      width: '100%',
      alignSelf: 'stretch',
      marginBottom: s(6)
    },
    outerHidden: {
      opacity: 0
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
      paddingLeft: s(8),
      paddingRight: s(14),
      paddingVertical: s(12),
      gap: s(6)
    },
    megaphone: {
      width: s(36),
      height: s(36),
      flexShrink: 0,
      marginLeft: s(20),
      marginRight: s(20)
    },
    textCol: {
      flex: 1,
      minWidth: 0,
      justifyContent: 'center',
      gap: s(3)
    },
    labelRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(8)
    },
    label: {
      fontFamily: appFonts.display,
      fontSize: t(15),
      lineHeight: t(18),
      color: figmaColors.charcoal,
      letterSpacing: 1.1
    },
    countBadge: {
      minWidth: s(20),
      height: s(20),
      borderRadius: s(10),
      paddingHorizontal: s(6),
      backgroundColor: figmaColors.sepia,
      alignItems: 'center',
      justifyContent: 'center'
    },
    countText: {
      fontFamily: appFonts.body,
      fontSize: tb(11),
      lineHeight: tb(14),
      color: figmaColors.textOnDark,
      fontWeight: '600'
    },
    previewTitle: {
      fontFamily: appFonts.display,
      fontSize: t(17),
      lineHeight: t(21),
      color: figmaColors.charcoal,
      letterSpacing: 0.2
    },
    previewBody: {
      fontFamily: appFonts.body,
      fontSize: tb(13),
      lineHeight: tb(17),
      color: figmaColors.textSecondary
    }
  });
}
