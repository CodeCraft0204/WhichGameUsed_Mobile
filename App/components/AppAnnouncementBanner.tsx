import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Image,
  ImageBackground,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View
} from 'react-native';
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

const SWIPE_DOWN_THRESHOLD = 36;

type BannerCardProps = {
  announcements: AppAnnouncement[];
  onOpen: () => void;
  hidden?: boolean;
};

function AnnouncementBannerCard({ announcements, onOpen, hidden = false }: BannerCardProps) {
  const { s, t } = useFigmaLayout();
  const styles = useMemo(() => createBannerStyles(s, t), [s, t]);
  const pullY = useRef(new Animated.Value(0)).current;
  const opening = useRef(false);

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

  const openModal = useCallback(() => {
    if (opening.current) return;
    opening.current = true;
    Animated.timing(pullY, {
      toValue: 0,
      duration: 160,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true
    }).start(() => {
      opening.current = false;
      onOpen();
    });
  }, [onOpen, pullY]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gesture) =>
          !opening.current &&
          gesture.dy > 10 &&
          gesture.dy > Math.abs(gesture.dx) * 1.2,
        onMoveShouldSetPanResponderCapture: (_, gesture) =>
          !opening.current &&
          gesture.dy > 14 &&
          gesture.dy > Math.abs(gesture.dx) * 1.5,
        onPanResponderMove: (_, gesture) => {
          if (opening.current) return;
          const next = Math.min(Math.max(gesture.dy, 0), s(28));
          pullY.setValue(next);
        },
        onPanResponderRelease: (_, gesture) => {
          if (opening.current) return;
          if (gesture.dy >= SWIPE_DOWN_THRESHOLD || gesture.vy > 0.55) {
            Animated.timing(pullY, {
              toValue: s(10),
              duration: 120,
              useNativeDriver: true
            }).start(() => openModal());
            return;
          }
          Animated.spring(pullY, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 5,
            speed: 20
          }).start();
        },
        onPanResponderTerminate: () => {
          Animated.spring(pullY, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 5,
            speed: 20
          }).start();
        }
      }),
    [openModal, pullY, s]
  );

  const pullScale = pullY.interpolate({
    inputRange: [0, s(28)],
    outputRange: [1, 0.992],
    extrapolate: 'clamp'
  });

  return (
    <View style={[styles.outer, hidden && styles.outerHidden]} pointerEvents={hidden ? 'none' : 'auto'}>
      <Animated.View
        style={{
          transform: [{ translateY: pullY }, { scale: pullScale }]
        }}
        {...panResponder.panHandlers}
      >
        <ImageBackground
          source={databaseIcons.announcementBanner}
          style={styles.banner}
          imageStyle={styles.bannerImage}
          resizeMode="stretch"
        >
          <View style={styles.pullHintRow}>
            <View style={styles.pullHandle} accessibilityElementsHidden importantForAccessibility="no" />
          </View>

          <Pressable
            style={styles.content}
            onPress={openModal}
            accessibilityRole="button"
            accessibilityHint="Swipe down or tap to view announcements"
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

              <Text style={styles.swipeHint}>Swipe down for details</Text>
            </View>
          </Pressable>
        </ImageBackground>
      </Animated.View>
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
        onOpen={() => setModalVisible(true)}
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
    pullHintRow: {
      alignItems: 'center',
      paddingTop: s(6)
    },
    pullHandle: {
      width: s(36),
      height: s(4),
      borderRadius: s(2),
      backgroundColor: 'rgba(74, 64, 53, 0.28)'
    },
    content: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      paddingLeft: s(8),
      paddingRight: s(14),
      paddingVertical: s(8),
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
    },
    swipeHint: {
      fontFamily: appFonts.body,
      fontSize: tb(11),
      lineHeight: tb(14),
      color: figmaColors.textSecondary,
      opacity: 0.85,
      marginTop: s(2)
    }
  });
}
