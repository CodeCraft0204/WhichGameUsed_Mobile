import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { appFonts } from '@/constants/appFonts';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import type { EducationTool } from '@/constants/educationContent';
import { figmaColors } from '@/constants/figmaColors';

type EducationToolCardProps = Omit<EducationTool, 'key'> & {
  s: (n: number) => number;
  t: (n: number) => number;
  onPress?: () => void;
};

export function EducationToolCard({
  icon,
  title,
  description,
  publisher,
  lastReviewed,
  footnote,
  s,
  t,
  onPress
}: EducationToolCardProps) {
  const styles = createStyles(s, t);

  return (
    <View style={styles.wrap}>
      <Pressable
        onPress={onPress}
        disabled={!onPress}
        style={({ pressed }) => [styles.card, pressed && onPress ? styles.pressed : null]}
        accessibilityRole={onPress ? 'button' : undefined}
      >
        <View style={styles.iconWrap}>
          <Image source={icon} style={styles.icon} resizeMode="contain" />
        </View>
        <View style={styles.body}>
          <View style={styles.metaRow}>
            <Text style={styles.publisher}>{publisher}</Text>
            <View style={styles.chip}>
              <Text style={styles.chipText}>TOOL · EXTERNAL</Text>
            </View>
          </View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.description}>{description}</Text>
          <Text style={styles.reviewed}>Reviewed {lastReviewed}</Text>
        </View>
        <Ionicons name="chevron-forward" size={s(16)} color={figmaColors.taupe} />
      </Pressable>
      {footnote ? <Text style={styles.footnote}>{footnote}</Text> : null}
    </View>
  );
}

function createStyles(s: (n: number) => number, t: (n: number) => number) {
  return StyleSheet.create({
    wrap: { marginBottom: s(10) },
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(10),
      backgroundColor: figmaColors.parchment,
      borderWidth: 1,
      borderColor: figmaColors.borderStrong,
      borderRadius: s(12),
      padding: s(12)
    },
    pressed: { opacity: 0.92 },
    iconWrap: {
      width: s(40),
      height: s(40),
      borderRadius: s(8),
      backgroundColor: figmaColors.surfaceMuted,
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      alignItems: 'center',
      justifyContent: 'center'
    },
    icon: { width: s(22), height: s(22) },
    body: { flex: 1, gap: s(3) },
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
      fontSize: t(15),
      color: figmaColors.charcoal
    },
    description: {
      fontFamily: appFonts.body,
      fontSize: t(13),
      lineHeight: t(17),
      color: figmaColors.gray
    },
    reviewed: {
      fontFamily: appFonts.body,
      fontSize: t(11),
      color: figmaColors.grayMuted
    },
    footnote: {
      marginTop: s(6),
      marginHorizontal: s(4),
      fontFamily: appFonts.body,
      fontSize: t(12),
      lineHeight: t(16),
      color: figmaColors.brownMuted
    }
  });
}
