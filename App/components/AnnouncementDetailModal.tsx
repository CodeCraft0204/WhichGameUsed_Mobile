import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  Easing,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthCheckbox } from '@/components/auth/AuthCheckbox';
import { AuthPrimaryButton } from '@/components/auth/AuthPrimaryButton';
import { appFonts } from '@/constants/appFonts';
import { bodyText } from '@/constants/appTypography';
import { figmaIcons } from '@/constants/figmaIcons';
import { figmaColors } from '@/constants/figmaColors';
import { dismissAnnouncement, type AppAnnouncement } from '@/lib/announcements';
import { useFigmaLayout } from '@/hooks/useFigmaLayout';

type Props = {
  visible: boolean;
  announcement: AppAnnouncement;
  subtitle: string;
  title: string;
  onClose: () => void;
  onDismissed: () => void;
};

const SLIDE_MS = 520;

export function AnnouncementDetailModal({
  visible,
  announcement,
  subtitle,
  title,
  onClose,
  onDismissed
}: Props) {
  const router = useRouter();
  const { s, t } = useFigmaLayout();
  const styles = useMemo(() => createStyles(s, t), [s, t]);
  const [neverShow, setNeverShow] = useState(false);
  const [rendered, setRendered] = useState(visible);
  const slideY = useRef(new Animated.Value(-Dimensions.get('window').height)).current;
  const fade = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;
    setNeverShow(false);
  }, [visible, announcement.id]);

  useEffect(() => {
    if (visible) {
      setRendered(true);
      slideY.setValue(-Dimensions.get('window').height * 0.55);
      fade.setValue(0);
      Animated.parallel([
        Animated.timing(slideY, {
          toValue: 0,
          duration: SLIDE_MS,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true
        }),
        Animated.timing(fade, {
          toValue: 1,
          duration: SLIDE_MS * 0.7,
          useNativeDriver: true
        })
      ]).start();
      return;
    }

    if (!rendered) return;

    Animated.parallel([
      Animated.timing(slideY, {
        toValue: Dimensions.get('window').height,
        duration: 360,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true
      }),
      Animated.timing(fade, {
        toValue: Dimensions.get('window').height * 0.5,
        duration: 280,
        useNativeDriver: true
      })
    ]).start(({ finished }) => {
      if (finished) setRendered(false);
    });
  }, [fade, rendered, slideY, visible]);

  const finish = async (navigate: boolean) => {
    if (neverShow) {
      await dismissAnnouncement(announcement.id);
      onDismissed();
    }
    onClose();
    if (navigate && announcement.link_path) {
      router.push(announcement.link_path as import('expo-router').Href);
    }
  };

  if (!rendered) return null;

  const linkLabel = title ? `View ${title}` : 'Continue';
  const combined = [subtitle, title].filter(Boolean).join(' ').trim();
  const extraBody =
    announcement.message.trim() && announcement.message.trim() !== combined
      ? announcement.message.trim()
      : '';

  return (
    <Modal visible={rendered} transparent animationType="none" onRequestClose={() => void finish(false)}>
      <View style={styles.root}>
        <Animated.View style={[styles.backdrop, { opacity: fade }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={() => void finish(false)} />
        </Animated.View>

        <Animated.View style={[styles.panelWrap, { transform: [{ translateY: slideY }] }]}>
          <SafeAreaView edges={['top', 'left', 'right']} style={styles.panel}>
            <View style={styles.handle} />

            <View style={styles.headerRow}>
              <Image source={figmaIcons.megaphone} style={styles.megaphone} resizeMode="contain" />
              <View style={styles.textCol}>
                <Text style={styles.title} numberOfLines={3}>
                  {title}
                </Text>
                {subtitle ? (
                  <Text style={styles.subtitle} numberOfLines={2}>
                    {subtitle}
                  </Text>
                ) : null}
              </View>
            </View>

            {extraBody ? <Text style={styles.body}>{extraBody}</Text> : null}

            <View style={styles.checkboxWrap}>
              <AuthCheckbox
                checked={neverShow}
                onToggle={() => setNeverShow((v) => !v)}
                label="Never show this again"
              />
            </View>

            {announcement.link_path ? (
              <AuthPrimaryButton label={linkLabel} onPress={() => finish(true)} />
            ) : null}

            <Pressable
              onPress={() => void finish(false)}
              style={styles.dismissBtn}
              accessibilityRole="button"
            >
              <Text style={styles.dismissText}>Not now</Text>
            </Pressable>
          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
}

function createStyles(s: (n: number) => number, t: (n: number) => number) {
  const tb = (n: number) => bodyText(t, n);

  return StyleSheet.create({
    root: {
      flex: 1,
      justifyContent: 'flex-start'
    },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(61, 52, 41, 0.45)'
    },
    panelWrap: {
      width: '100%'
    },
    panel: {
      backgroundColor: figmaColors.background,
      borderBottomLeftRadius: s(20),
      borderBottomRightRadius: s(20),
      paddingHorizontal: s(20),
      paddingBottom: s(20),
      shadowColor: figmaColors.charcoal,
      shadowOpacity: 0.12,
      shadowRadius: s(12),
      shadowOffset: { width: 0, height: s(6) },
      elevation: 8
    },
    handle: {
      alignSelf: 'center',
      width: s(40),
      height: s(4),
      borderRadius: s(2),
      backgroundColor: figmaColors.divider,
      marginBottom: s(16)
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: s(12),
      marginBottom: s(14)
    },
    megaphone: {
      width: s(44),
      height: s(44),
      flexShrink: 0
    },
    textCol: {
      flex: 1,
      minWidth: 0,
      gap: s(4)
    },
    subtitle: {
      fontFamily: appFonts.body,
      fontSize: tb(20),
      lineHeight: tb(40),
      color: figmaColors.gray
    },
    title: {
      fontFamily: appFonts.display,
      fontSize: t(22),
      lineHeight: t(28),
      color: figmaColors.charcoal,
      letterSpacing: 0.2
    },
    body: {
      fontFamily: appFonts.body,
      fontSize: tb(16),
      lineHeight: tb(22),
      color: figmaColors.gray,
      marginBottom: s(18)
    },
    checkboxWrap: {
      marginTop: s(4),
      marginBottom: s(8)
    },
    dismissBtn: {
      alignItems: 'center',
      paddingVertical: s(12),
      marginTop: s(4)
    },
    dismissText: {
      fontFamily: appFonts.body,
      fontSize: tb(16),
      color: figmaColors.gray
    }
  });
}
