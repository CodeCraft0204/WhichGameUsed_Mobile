/** Compact teaser on the leaderboard — opens the full How Points Work guide. */
import React, { useMemo } from 'react';
import { appFonts } from '@/constants/appFonts';
import { Ionicons } from '@expo/vector-icons';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { BREAKDOWN_ICONS } from '@/constants/leaderboardAssets';
import { leaderboardCopy } from '@/constants/leaderboardCopy';
import { pointsWorkCopy } from '@/constants/pointsWorkCopy';
import { figmaColors } from '@/constants/figmaColors';
import { bodyText } from '@/constants/appTypography';

type ExplainerProps = {
  s: (n: number) => number;
  t: (n: number) => number;
  onSeeAll?: () => void;
};

const TEASER_CATEGORIES = [
  { key: 'auth', label: 'Auth', icon: BREAKDOWN_ICONS.auth },
  { key: 'research', label: 'Research', icon: BREAKDOWN_ICONS.research },
  { key: 'forum', label: 'Discussion', icon: BREAKDOWN_ICONS.forum }
] as const;

export function LeaderboardPointsExplainer({ s, t, onSeeAll }: ExplainerProps) {
  const styles = useMemo(() => createStyles(s, t), [s, t]);

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && onSeeAll && styles.pressed]}
      onPress={onSeeAll}
      disabled={!onSeeAll}
      accessibilityRole="button"
      accessibilityLabel={`${leaderboardCopy.howPointsTitle}. ${pointsWorkCopy.seeFullGuide}`}
    >
      <Text style={styles.title}>{leaderboardCopy.howPointsTitle}</Text>
      <Text style={styles.hint}>{leaderboardCopy.explainerHint}</Text>

      <View style={styles.chips}>
        {TEASER_CATEGORIES.map(({ key, label, icon }) => (
          <View key={key} style={styles.chip}>
            <Image source={icon} style={styles.chipIcon} resizeMode="contain" />
            <Text style={styles.chipLabel}>{label}</Text>
          </View>
        ))}
      </View>

      {onSeeAll ? (
        <View style={styles.linkRow}>
          <Text style={styles.link}>{pointsWorkCopy.seeFullGuide}</Text>
          <Ionicons name="chevron-forward" size={s(14)} color={figmaColors.navActive} />
        </View>
      ) : null}
    </Pressable>
  );
}

function createStyles(s: (n: number) => number, t: (n: number) => number) {
  const tb = (n: number) => bodyText(t, n);

  return StyleSheet.create({
    card: {
      flex: 1,
      backgroundColor: figmaColors.cream,
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      borderRadius: s(14),
      padding: s(12),
      minWidth: 0
    },
    pressed: {
      opacity: 0.9
    },
    title: {
      fontFamily: appFonts.display,
      fontSize: t(14),
      color: figmaColors.charcoal,
      marginBottom: s(4),
      textTransform: 'uppercase',
      letterSpacing: 0.4
    },
    hint: {
      fontFamily: appFonts.body,
      fontSize: tb(12),
      lineHeight: tb(16),
      color: figmaColors.gray,
      marginBottom: s(10)
    },
    chips: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: s(6),
      marginBottom: s(10)
    },
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(4),
      backgroundColor: figmaColors.surfaceElevated,
      borderRadius: s(12),
      paddingHorizontal: s(8),
      paddingVertical: s(4)
    },
    chipIcon: {
      width: s(16),
      height: s(16)
    },
    chipLabel: {
      fontFamily: appFonts.body,
      fontSize: tb(11),
      color: figmaColors.charcoal
    },
    linkRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(2)
    },
    link: {
      fontFamily: appFonts.accent,
      fontSize: tb(12),
      color: figmaColors.navActive,
      letterSpacing: 0.4
    }
  });
}
