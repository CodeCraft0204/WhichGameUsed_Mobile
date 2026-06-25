import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  ImageBackground,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { appFonts } from '@/constants/appFonts';
import { bodyText } from '@/constants/appTypography';
import { databaseIcons } from '@/constants/databaseContent';
import { figmaIcons } from '@/constants/figmaIcons';
import { figmaColors } from '@/constants/figmaColors';
import {
  dismissAnnouncement,
  getAnnouncementDisplay,
  type AppAnnouncement
} from '@/lib/announcements';
import { useFigmaLayout } from '@/hooks/useFigmaLayout';

type Props = {
  visible: boolean;
  announcements: AppAnnouncement[];
  onClose: () => void;
  onDismissed: (id: string) => void;
};

const OPEN_MS = 480;
const CLOSE_MS = 360;

export function AnnouncementDetailModal({
  visible,
  announcements,
  onClose,
  onDismissed
}: Props) {
  const router = useRouter();
  const { s, t } = useFigmaLayout();
  const screenHeight = Dimensions.get('window').height;
  const scrollMaxHeight = screenHeight * 0.5;
  const listHeight = Math.min(
    scrollMaxHeight,
    Math.max(s(128), announcements.length * s(136) + s(12))
  );
  const panelHeight = Math.min(screenHeight * 0.68, listHeight + s(118));
  const styles = useMemo(
    () => createStyles(s, t, listHeight, panelHeight),
    [listHeight, panelHeight, s, t]
  );

  const [neverShowIds, setNeverShowIds] = useState<Record<string, boolean>>({});
  const [rendered, setRendered] = useState(visible);
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const panelY = useRef(new Animated.Value(-panelHeight)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;
    setNeverShowIds({});
  }, [visible]);

  useEffect(() => {
    panelY.setValue(-panelHeight);
  }, [panelHeight, panelY]);

  useEffect(() => {
    if (visible) {
      setRendered(true);
      backdropOpacity.setValue(0);
      panelY.setValue(-panelHeight);
      contentOpacity.setValue(0);

      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: OPEN_MS * 0.85,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true
        }),
        Animated.timing(panelY, {
          toValue: 0,
          duration: OPEN_MS,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true
        })
      ]).start();

      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: OPEN_MS * 0.7,
        delay: OPEN_MS * 0.28,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true
      }).start();
      return;
    }

    if (!rendered) return;

    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: CLOSE_MS,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true
      }),
      Animated.timing(contentOpacity, {
        toValue: 0,
        duration: CLOSE_MS * 0.5,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true
      }),
      Animated.timing(panelY, {
        toValue: -panelHeight,
        duration: CLOSE_MS,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true
      })
    ]).start(({ finished }) => {
      if (finished) setRendered(false);
    });
  }, [backdropOpacity, contentOpacity, panelHeight, panelY, rendered, visible]);

  const finish = async () => {
    const ids = Object.entries(neverShowIds)
      .filter(([, checked]) => checked)
      .map(([id]) => id);

    await Promise.all(ids.map((id) => dismissAnnouncement(id)));
    ids.forEach((id) => onDismissed(id));
    onClose();
  };

  const openLink = async (row: AppAnnouncement) => {
    if (neverShowIds[row.id]) {
      await dismissAnnouncement(row.id);
      onDismissed(row.id);
    }
    onClose();
    if (row.link_path) {
      router.push(row.link_path as import('expo-router').Href);
    }
  };

  if (!rendered || announcements.length === 0) return null;

  const boxSize = s(18);

  return (
    <Modal visible={rendered} transparent animationType="none" onRequestClose={() => void finish()}>
      <View style={styles.root}>
        <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => void finish()} />
        </Animated.View>

        <Animated.View
          style={[styles.panelWrap, { height: panelHeight, transform: [{ translateY: panelY }] }]}
        >
          <ImageBackground
            source={databaseIcons.announcementBannerBig}
            style={styles.bannerBg}
            imageStyle={styles.bannerBgImage}
            resizeMode="stretch"
          >
            <SafeAreaView edges={['top', 'left', 'right']} style={styles.bannerSafe}>
              <Animated.View style={[styles.bannerContent, { opacity: contentOpacity }]}>
                <View style={styles.sheetHeader}>
                  <Image source={figmaIcons.megaphone} style={styles.headerIcon} resizeMode="contain" />
                  <Text style={styles.sheetTitle}>ANNOUNCEMENTS</Text>
                  <View style={styles.headerBadge}>
                    <Text style={styles.headerBadgeText}>{announcements.length}</Text>
                  </View>
                </View>

                <ScrollView
                  style={styles.scroll}
                  contentContainerStyle={styles.scrollContent}
                  showsVerticalScrollIndicator={false}
                  bounces={announcements.length > 2}
                >
                  {announcements.map((row) => {
                    const { title, content } = getAnnouncementDisplay(row);
                    const neverShow = !!neverShowIds[row.id];

                    return (
                      <View key={row.id} style={styles.card}>
                        <Text style={styles.cardTitle} numberOfLines={2}>
                          {title}
                        </Text>

                        {content ? (
                          <Text style={styles.cardBody} numberOfLines={4}>
                            {content}
                          </Text>
                        ) : null}

                        <View style={styles.cardActions}>
                          <Pressable
                            style={styles.checkboxRow}
                            onPress={() =>
                              setNeverShowIds((prev) => ({ ...prev, [row.id]: !prev[row.id] }))
                            }
                            accessibilityRole="checkbox"
                            accessibilityState={{ checked: neverShow }}
                          >
                            <View
                              style={[
                                styles.checkboxBox,
                                { width: boxSize, height: boxSize },
                                neverShow && styles.checkboxBoxChecked
                              ]}
                            >
                              {neverShow ? (
                                <Ionicons
                                  name="checkmark"
                                  size={s(12)}
                                  color={figmaColors.textOnDark}
                                />
                              ) : null}
                            </View>
                            <Text style={styles.checkboxLabel}>Never show this again</Text>
                          </Pressable>

                          {row.link_path ? (
                            <Pressable
                              style={styles.linkBtn}
                              onPress={() => void openLink(row)}
                              accessibilityRole="button"
                            >
                              <Text style={styles.linkBtnText} numberOfLines={1}>
                                View {title}
                              </Text>
                            </Pressable>
                          ) : null}
                        </View>
                      </View>
                    );
                  })}
                </ScrollView>

                <Pressable
                  onPress={() => void finish()}
                  style={styles.dismissBtn}
                  accessibilityRole="button"
                >
                  <Text style={styles.dismissText}>Not now</Text>
                </Pressable>
              </Animated.View>
            </SafeAreaView>
          </ImageBackground>
        </Animated.View>
      </View>
    </Modal>
  );
}

function createStyles(
  s: (n: number) => number,
  t: (n: number) => number,
  listHeight: number,
  panelHeight: number
) {
  const tb = (n: number) => bodyText(t, n);

  return StyleSheet.create({
    root: {
      flex: 1
    },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(61, 52, 41, 0.45)'
    },
    panelWrap: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 2,
      elevation: 8,
      height: panelHeight
    },
    bannerBg: {
      flex: 1,
      width: '100%',
      height: panelHeight
    },
    bannerBgImage: {
      width: '100%',
      height: '100%',
      resizeMode: 'stretch'
    },
    bannerSafe: {
      flex: 1
    },
    bannerContent: {
      flex: 1,
      paddingHorizontal: s(18),
      paddingBottom: s(44)
    },
    sheetHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(8),
      marginBottom: s(12),
      paddingTop: s(4)
    },
    headerIcon: {
      width: s(32),
      height: s(32),
      flexShrink: 0
    },
    sheetTitle: {
      flex: 1,
      fontFamily: appFonts.display,
      fontSize: t(18),
      lineHeight: t(22),
      color: figmaColors.charcoal,
      letterSpacing: 1,
      marginTop: s(18),
      marginBottom: s(18),
    },
    headerBadge: {
      minWidth: s(24),
      height: s(24),
      borderRadius: s(12),
      paddingHorizontal: s(8),
      backgroundColor: figmaColors.sepia,
      alignItems: 'center',
      justifyContent: 'center'
    },
    headerBadgeText: {
      fontFamily: appFonts.body,
      fontSize: tb(12),
      lineHeight: tb(16),
      color: figmaColors.textOnDark,
      fontWeight: '600'
    },
    scroll: {
      maxHeight: listHeight
    },
    scrollContent: {
      gap: s(10),
      paddingBottom: s(6)
    },
    card: {
      borderRadius: s(12),
      borderWidth: 1,
      borderColor: 'rgba(74, 64, 53, 0.22)',
      backgroundColor: 'rgba(247, 241, 228, 0.78)',
      paddingHorizontal: s(14),
      paddingVertical: s(12),
      gap: s(6)
    },
    cardTitle: {
      fontFamily: appFonts.display,
      fontSize: t(18),
      lineHeight: t(24),
      color: figmaColors.charcoal,
      letterSpacing: 0.2
    },
    cardBody: {
      fontFamily: appFonts.body,
      fontSize: tb(15),
      lineHeight: tb(21),
      color: figmaColors.textSecondary
    },
    cardActions: {
      gap: s(8),
      marginTop: s(4)
    },
    checkboxRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(8)
    },
    checkboxBox: {
      borderRadius: s(4),
      borderWidth: 1,
      borderColor: figmaColors.sepia,
      backgroundColor: 'rgba(253, 249, 242, 0.9)',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0
    },
    checkboxBoxChecked: {
      backgroundColor: figmaColors.sepia
    },
    checkboxLabel: {
      flex: 1,
      fontFamily: appFonts.body,
      fontSize: tb(13),
      lineHeight: tb(18),
      color: figmaColors.textSecondary
    },
    linkBtn: {
      alignSelf: 'flex-start',
      minHeight: s(40),
      borderRadius: s(10),
      backgroundColor: figmaColors.buttonPrimaryBg,
      borderWidth: s(2),
      borderColor: figmaColors.buttonPrimaryBorder,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: s(14),
      paddingVertical: s(8)
    },
    linkBtnText: {
      fontFamily: appFonts.display,
      fontSize: t(14),
      lineHeight: t(20),
      color: figmaColors.buttonPrimaryText,
      letterSpacing: 0.2
    },
    dismissBtn: {
      alignItems: 'center',
      paddingVertical: s(5),
      marginTop: s(20)
    },
    dismissText: {
      fontFamily: appFonts.body,
      fontSize: tb(15),
      lineHeight: tb(15),
      color: figmaColors.textSecondary
    }
  });
}
