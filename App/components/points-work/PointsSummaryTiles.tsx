import React, { useMemo } from 'react';
import { appFonts } from '@/constants/appFonts';
import { Image, StyleSheet, Text, View } from 'react-native';
import { BREAKDOWN_ICONS } from '@/constants/leaderboardAssets';
import { pointsWorkCopy } from '@/constants/pointsWorkCopy';
import { bodyText } from '@/constants/appTypography';
import { figmaColors } from '@/constants/figmaColors';
import { summaryHintForCategory } from '@/lib/points-work';
import type { LeaderboardPointRule } from '@/lib/leaderboard';

type Props = {
  rules: LeaderboardPointRule[];
  s: (n: number) => number;
  t: (n: number) => number;
};

const TILES = [
  { key: 'auth' as const, icon: BREAKDOWN_ICONS.auth },
  { key: 'research' as const, icon: BREAKDOWN_ICONS.research },
  { key: 'forum' as const, icon: BREAKDOWN_ICONS.forum }
];

export function PointsSummaryTiles({ rules, s, t }: Props) {
  const styles = useMemo(() => createStyles(s, t), [s, t]);

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{pointsWorkCopy.summaryTitle}</Text>
      <View style={styles.row}>
        {TILES.map(({ key, icon }) => (
          <View key={key} style={styles.tile}>
            <Image source={icon} style={styles.icon} resizeMode="contain" />
            <View style={styles.textCol}>
              <Text style={styles.label}>{pointsWorkCopy.summary[key].label}</Text>
              <Text style={styles.hint}>{summaryHintForCategory(key, rules)}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

function createStyles(s: (n: number) => number, t: (n: number) => number) {
  const tb = (n: number) => bodyText(t, n);

  return StyleSheet.create({
    wrap: {
      marginBottom: s(16)
    },
    title: {
      fontFamily: appFonts.accent,
      fontSize: tb(12),
      color: figmaColors.gray,
      letterSpacing: 1,
      textTransform: 'uppercase',
      marginBottom: s(8)
    },
    row: {
      gap: s(8)
    },
    tile: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: s(10),
      backgroundColor: figmaColors.cream,
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      borderRadius: s(12),
      padding: s(12)
    },
    icon: {
      width: s(32),
      height: s(32),
      flexShrink: 0,
      marginTop: s(2)
    },
    textCol: {
      flex: 1,
      gap: s(2),
      minWidth: 0
    },
    label: {
      fontFamily: appFonts.bodyBold,
      fontSize: tb(15),
      color: figmaColors.charcoal
    },
    hint: {
      fontFamily: appFonts.body,
      fontSize: tb(14),
      lineHeight: tb(19),
      color: figmaColors.gray
    }
  });
}
