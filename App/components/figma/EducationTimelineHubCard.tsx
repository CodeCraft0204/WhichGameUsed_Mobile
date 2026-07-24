import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import type { EducationTimelineCard } from '@/constants/educationContent';
import { appFonts } from '@/constants/appFonts';
import { figmaColors } from '@/constants/figmaColors';

type Props = Omit<EducationTimelineCard, 'key'> & {
  s: (n: number) => number;
  t: (n: number) => number;
  onPress?: () => void;
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
  onPress
}: Props) {
  const styles = createStyles(s, t);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed ? styles.pressed : null]}
      accessibilityRole="button"
      accessibilityLabel={title}
    >
      <Image source={image} style={styles.image} resizeMode="cover" />
      <View style={styles.metaRow}>
        <Text style={styles.publisher}>{publisher}</Text>
        <View style={styles.chip}>
          <Text style={styles.chipText}>HOBBY TIMELINE</Text>
        </View>
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.body} numberOfLines={3}>
        {description}
      </Text>
      <Text style={styles.meta}>
        {yearRange} · {lengthLabel} · Reviewed {lastReviewed}
      </Text>
      <Text style={styles.cta}>Open interactive timeline</Text>
    </Pressable>
  );
}

function createStyles(s: (n: number) => number, t: (n: number) => number) {
  return StyleSheet.create({
    card: {
      width: s(280),
      backgroundColor: figmaColors.cream,
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      borderRadius: s(14),
      padding: s(12),
      marginRight: s(12),
      gap: s(6)
    },
    image: {
      width: '100%',
      height: s(110),
      borderRadius: s(8),
      backgroundColor: figmaColors.surfaceMuted
    },
    metaRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: s(6),
      marginTop: s(4)
    },
    publisher: {
      fontFamily: appFonts.body,
      fontSize: t(12),
      color: figmaColors.brownMuted
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
      fontSize: t(10),
      color: figmaColors.brown,
      letterSpacing: 0.5
    },
    title: {
      fontFamily: appFonts.display,
      fontSize: t(18),
      color: figmaColors.ink
    },
    body: {
      fontFamily: appFonts.body,
      fontSize: t(13),
      lineHeight: t(18),
      color: figmaColors.charcoal
    },
    meta: {
      fontFamily: appFonts.body,
      fontSize: t(11),
      color: figmaColors.brownMuted
    },
    cta: {
      fontFamily: appFonts.accent,
      fontSize: t(11),
      letterSpacing: 0.4,
      color: figmaColors.bronze,
      marginTop: s(2)
    },
    pressed: {
      opacity: 0.88
    }
  });
}
