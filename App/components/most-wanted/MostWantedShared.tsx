import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import {
  ActivityIndicator,
  Image,
  type ImageSourcePropType,
  Pressable,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { appFonts } from '@/constants/appFonts';
import { contributionStatusColors, type MwContributionStatus } from '@/constants/mostWantedStyles';
import { figmaColors } from '@/constants/figmaColors';

export function MostWantedSectionLabel({
  title,
  subtitle,
  s,
  t
}: {
  title: string;
  subtitle?: string;
  s: (n: number) => number;
  t: (n: number) => number;
}) {
  const styles = useMemo(() => createSectionStyles(s, t), [s, t]);
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

export function MostWantedContributorBadge({
  label,
  s,
  t,
  large,
  icon = 'ribbon',
  imageSource
}: {
  label: string;
  s: (n: number) => number;
  t: (n: number) => number;
  large?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  imageSource?: ImageSourcePropType | null;
}) {
  const styles = useMemo(() => createRewardStyles(s, t, large), [s, t, large]);
  if (imageSource) {
    return (
      <View style={styles.imageBadge}>
        <Image source={imageSource} style={styles.image} resizeMode="contain" />
        <Text style={styles.imageLabel} numberOfLines={2}>
          {label}
        </Text>
      </View>
    );
  }
  return (
    <View style={styles.badge}>
      <Ionicons name={icon} size={large ? s(16) : s(12)} color={figmaColors.accentStrong} />
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

export function MostWantedStatusBadge({
  status,
  label,
  s,
  t
}: {
  status: MwContributionStatus;
  label: string;
  s: (n: number) => number;
  t: (n: number) => number;
}) {
  const colors = contributionStatusColors(status);
  const styles = useMemo(() => createStatusBadgeStyles(s, t, colors), [s, t, colors]);
  return (
    <View style={styles.badge}>
      <Text style={styles.text}>{label}</Text>
    </View>
  );
}

export function MostWantedEmptyState({
  title,
  body,
  icon = 'search-outline',
  s,
  t
}: {
  title: string;
  body: string;
  icon?: keyof typeof Ionicons.glyphMap;
  s: (n: number) => number;
  t: (n: number) => number;
}) {
  const styles = useMemo(() => createEmptyStyles(s, t), [s, t]);
  return (
    <View style={styles.wrap}>
      <View style={styles.iconRing}>
        <Ionicons name={icon} size={s(26)} color={figmaColors.accent} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.body}>{body}</Text>
    </View>
  );
}

export function MostWantedLoadingState({
  message,
  s,
  t
}: {
  message: string;
  s: (n: number) => number;
  t: (n: number) => number;
}) {
  const styles = useMemo(() => createEmptyStyles(s, t), [s, t]);
  return (
    <View style={styles.wrap}>
      <ActivityIndicator color={figmaColors.charcoal} size="large" />
      <Text style={styles.body}>{message}</Text>
    </View>
  );
}

export function MostWantedCardSkeleton({ s }: { s: (n: number) => number }) {
  const styles = useMemo(() => createSkeletonStyles(s), [s]);
  return (
    <View style={styles.card}>
      <View style={styles.image} />
      <View style={styles.lineLg} />
      <View style={styles.lineMd} />
      <View style={styles.track} />
    </View>
  );
}

export function MostWantedLinkPill({
  label,
  onPress,
  s,
  t
}: {
  label: string;
  onPress: () => void;
  s: (n: number) => number;
  t: (n: number) => number;
}) {
  const styles = useMemo(() => createLinkStyles(s, t), [s, t]);
  return (
    <Pressable onPress={onPress} style={styles.pill}>
      <Text style={styles.text}>{label}</Text>
    </Pressable>
  );
}

function createSectionStyles(s: (n: number) => number, t: (n: number) => number) {
  return StyleSheet.create({
    wrap: { marginBottom: s(12), gap: s(4) },
    title: {
      fontFamily: appFonts.display,
      fontSize: t(20),
      color: figmaColors.charcoal
    },
    subtitle: {
      fontFamily: appFonts.body,
      fontSize: t(14),
      lineHeight: t(20),
      color: figmaColors.gray
    }
  });
}

function createRewardStyles(s: (n: number) => number, t: (n: number) => number, large?: boolean) {
  return StyleSheet.create({
    badge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(5),
      backgroundColor: figmaColors.tagBg,
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      borderRadius: s(20),
      paddingHorizontal: s(large ? 12 : 8),
      paddingVertical: s(large ? 6 : 4)
    },
    icon: { width: s(large ? 16 : 13), height: s(large ? 16 : 13) },
    text: {
      fontFamily: appFonts.bodyBold,
      fontSize: t(large ? 14 : 11),
      color: figmaColors.charcoal
    },
    imageBadge: {
      width: s(large ? 88 : 72),
      alignItems: 'center',
      gap: s(4)
    },
    image: {
      width: s(large ? 80 : 64),
      height: s(large ? 96 : 76)
    },
    imageLabel: {
      fontFamily: appFonts.bodyBold,
      fontSize: t(10),
      color: figmaColors.charcoal,
      textAlign: 'center'
    }
  });
}

function createStatusBadgeStyles(
  s: (n: number) => number,
  t: (n: number) => number,
  colors: { bg: string; border: string; text: string }
) {
  return StyleSheet.create({
    badge: {
      backgroundColor: colors.bg,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: s(8),
      paddingHorizontal: s(8),
      paddingVertical: s(3)
    },
    text: {
      fontFamily: appFonts.accent,
      fontSize: t(9),
      letterSpacing: 0.5,
      color: colors.text,
      textTransform: 'uppercase'
    }
  });
}

function createEmptyStyles(s: (n: number) => number, t: (n: number) => number) {
  return StyleSheet.create({
    wrap: {
      alignItems: 'center',
      paddingVertical: s(28),
      paddingHorizontal: s(16),
      gap: s(8)
    },
    iconRing: {
      width: s(56),
      height: s(56),
      borderRadius: s(28),
      backgroundColor: figmaColors.surfaceHighlight,
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: s(4)
    },
    title: {
      fontFamily: appFonts.bodyBold,
      fontSize: t(17),
      color: figmaColors.charcoal,
      textAlign: 'center'
    },
    body: {
      fontFamily: appFonts.body,
      fontSize: t(14),
      lineHeight: t(20),
      color: figmaColors.gray,
      textAlign: 'center',
      maxWidth: s(280)
    }
  });
}

function createSkeletonStyles(s: (n: number) => number) {
  return StyleSheet.create({
    card: {
      backgroundColor: figmaColors.cream,
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      borderRadius: s(14),
      padding: s(14),
      marginBottom: s(12),
      gap: s(10)
    },
    image: {
      height: s(140),
      borderRadius: s(10),
      backgroundColor: figmaColors.stone
    },
    lineLg: {
      height: s(14),
      width: '75%',
      borderRadius: s(4),
      backgroundColor: figmaColors.stone
    },
    lineMd: {
      height: s(10),
      width: '50%',
      borderRadius: s(4),
      backgroundColor: figmaColors.stoneDark
    },
    track: {
      height: s(8),
      borderRadius: s(4),
      backgroundColor: figmaColors.progressTrack
    }
  });
}

function createLinkStyles(s: (n: number) => number, t: (n: number) => number) {
  return StyleSheet.create({
    pill: {
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      borderRadius: s(20),
      paddingHorizontal: s(12),
      paddingVertical: s(6),
      backgroundColor: figmaColors.cream
    },
    text: {
      fontFamily: appFonts.bodyBold,
      fontSize: t(13),
      color: figmaColors.accent
    }
  });
}
