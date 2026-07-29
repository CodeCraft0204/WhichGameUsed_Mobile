import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import type { EducationTimelineCard } from '@/constants/educationContent';
import { educationIcons } from '@/constants/educationContent';
import { appFonts } from '@/constants/appFonts';
import { figmaColors } from '@/constants/figmaColors';

type Props = Omit<EducationTimelineCard, 'key'> & {
  s: (n: number) => number;
  t: (n: number) => number;
  onPress?: () => void;
  compact?: boolean;
};

export function EducationTimelineHubCard({
  title,
  description,
  publisher,
  lengthLabel,
  yearRange,
  lastReviewed,
  image,
  s,
  t,
  onPress,
  compact
}: Props) {
  const styles = createStyles(s, t, compact);
  const iconWidth = s(compact ? 22 : 28);
  const iconHeight = s(compact ? 26 : 32);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed ? styles.pressed : null]}
      accessibilityRole="button"
      accessibilityLabel={title}
    >
      <View style={styles.topRow}>
        <View style={[styles.pdfBadge, { width: iconWidth, height: iconHeight + s(4) }]}>
          <Image
            source={educationIcons.pdfIcon}
            style={{ width: iconWidth, height: iconHeight }}
            resizeMode="contain"
          />
        </View>
        <View style={styles.chip}>
          <Text style={styles.chipText}>HOBBY TIMELINE</Text>
        </View>
      </View>

      <View style={styles.imageWrap}>
        <Image source={image} style={styles.image} resizeMode="cover" />
      </View>

      <Text style={styles.publisher} numberOfLines={1}>
        {publisher}
      </Text>
      <Text style={styles.title} numberOfLines={compact ? 2 : 3}>
        {title}
      </Text>
      {!compact ? (
        <Text style={styles.description} numberOfLines={3}>
          {description}
        </Text>
      ) : null}
      <Text style={styles.meta}>
        {yearRange} · {lengthLabel}
      </Text>
      <Text style={styles.reviewed}>Reviewed {lastReviewed}</Text>
      <Text style={styles.cta}>Open interactive timeline</Text>
    </Pressable>
  );
}

function createStyles(s: (n: number) => number, t: (n: number) => number, compact?: boolean) {
  return StyleSheet.create({
    card: {
      width: s(compact ? 200 : 230),
      minHeight: s(compact ? 280 : 367),
      backgroundColor: figmaColors.cream,
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      borderRadius: s(16),
      paddingHorizontal: s(12),
      paddingBottom: s(12),
      marginRight: 0,
      overflow: 'hidden'
    },
    pressed: { opacity: 0.88 },
    topRow: {
      marginTop: s(10),
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    pdfBadge: {
      alignItems: 'center',
      justifyContent: 'flex-start',
      overflow: 'hidden'
    },
    chip: {
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      backgroundColor: figmaColors.tagBg,
      borderRadius: s(4),
      paddingHorizontal: s(6),
      paddingVertical: s(2)
    },
    chipText: {
      fontFamily: appFonts.accent,
      fontSize: t(9),
      letterSpacing: 0.4,
      color: figmaColors.brown
    },
    imageWrap: {
      width: '100%',
      height: s(compact ? 120 : 160),
      marginTop: s(6),
      borderRadius: s(8),
      overflow: 'hidden',
      backgroundColor: figmaColors.surfaceHighlight,
      alignItems: 'center',
      justifyContent: 'center'
    },
    image: {
      width: '100%',
      height: '100%'
    },
    publisher: {
      marginTop: s(6),
      fontFamily: appFonts.body,
      fontSize: t(12),
      color: figmaColors.brownMuted
    },
    title: {
      marginTop: s(4),
      fontFamily: appFonts.bodyBold,
      fontSize: t(compact ? 16 : 20),
      lineHeight: t(compact ? 20 : 26),
      color: figmaColors.charcoal
    },
    description: {
      marginTop: s(8),
      fontFamily: appFonts.body,
      fontSize: t(15),
      lineHeight: t(20),
      color: figmaColors.gray
    },
    meta: {
      marginTop: s(10),
      fontFamily: appFonts.body,
      fontSize: t(12),
      color: figmaColors.gray
    },
    reviewed: {
      marginTop: s(4),
      fontFamily: appFonts.body,
      fontSize: t(11),
      color: figmaColors.grayMuted
    },
    cta: {
      marginTop: s(8),
      fontFamily: appFonts.accent,
      fontSize: t(11),
      letterSpacing: 0.4,
      color: figmaColors.bronze
    }
  });
}
