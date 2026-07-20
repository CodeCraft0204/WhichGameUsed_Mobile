import React from 'react';
import { appFonts } from '@/constants/appFonts';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { EducationCaseStudy } from '@/constants/educationContent';
import { figmaColors } from '@/constants/figmaColors';

type EducationCaseStudyCardProps = Omit<EducationCaseStudy, 'key'> & {
  s: (n: number) => number;
  t: (n: number) => number;
  onPressCta?: () => void;
};

export function EducationCaseStudyCard({
  title,
  body,
  publisher,
  lastReviewed,
  ctaLabel,
  s,
  t,
  onPressCta
}: EducationCaseStudyCardProps) {
  const styles = createStyles(s, t);

  return (
    <View style={styles.card}>
      <View style={styles.metaRow}>
        <Text style={styles.publisher}>{publisher}</Text>
        <View style={styles.chip}>
          <Text style={styles.chipText}>CASE STUDY</Text>
        </View>
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.body}>{body}</Text>
      <Text style={styles.reviewed}>Reviewed {lastReviewed}</Text>
      <Pressable
        onPress={onPressCta}
        disabled={!onPressCta}
        style={({ pressed }) => [styles.cta, pressed && onPressCta ? styles.pressed : null]}
        accessibilityRole="button"
        accessibilityLabel={ctaLabel}
      >
        <Text style={styles.ctaText}>{ctaLabel}</Text>
      </Pressable>
    </View>
  );
}

function createStyles(s: (n: number) => number, t: (n: number) => number) {
  return StyleSheet.create({
    card: {
      backgroundColor: figmaColors.cream,
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      borderRadius: s(14),
      padding: s(14),
      marginBottom: s(12),
      gap: s(6)
    },
    metaRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: s(6)
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
      fontSize: t(9),
      letterSpacing: 0.3,
      color: figmaColors.brown
    },
    title: {
      fontFamily: appFonts.bodyBold,
      fontSize: t(18),
      lineHeight: t(23),
      color: figmaColors.charcoal
    },
    body: {
      fontFamily: appFonts.body,
      fontSize: t(14),
      lineHeight: t(20),
      color: figmaColors.gray
    },
    reviewed: {
      fontFamily: appFonts.body,
      fontSize: t(11),
      color: figmaColors.grayMuted
    },
    cta: {
      marginTop: s(6),
      alignSelf: 'flex-start',
      backgroundColor: figmaColors.umber,
      borderWidth: 1,
      borderColor: figmaColors.charcoal,
      borderRadius: s(8),
      paddingHorizontal: s(12),
      paddingVertical: s(8)
    },
    pressed: { opacity: 0.9 },
    ctaText: {
      fontFamily: appFonts.accent,
      fontSize: t(11),
      letterSpacing: 0.5,
      color: figmaColors.cream
    }
  });
}
