import React from 'react';
import { appFonts } from '@/constants/appFonts';
import { StyleSheet, Text, View } from 'react-native';
import { bodyText } from '@/constants/appTypography';
import { figmaColors } from '@/constants/figmaColors';
import { rankTheme } from '@/lib/leaderboard-ui';

type Props = {
  rank: number;
  label?: string;
  s: (n: number) => number;
  t: (n: number) => number;
  size?: 'sm' | 'md';
};

/** Rank seal with dynamic number — avoids baked-in digit art from Figma exports. */
export function LeaderboardRankSeal({ rank, label, s, t, size = 'md' }: Props) {
  const styles = createStyles(s, t, size, !!label);
  const theme = rankTheme(rank);
  const digits = String(rank).length;

  return (
    <View style={[styles.wrap, { borderColor: theme.accent }]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <Text
        style={[
          styles.rank,
          { color: theme.accent },
          digits >= 2 && styles.rankCompact,
          digits >= 3 && styles.rankTight
        ]}
      >
        {rank}
      </Text>
    </View>
  );
}

function createStyles(
  s: (n: number) => number,
  t: (n: number) => number,
  size: 'sm' | 'md',
  hasLabel: boolean
) {
  const tb = (n: number) => bodyText(t, n);
  const dim = size === 'sm' ? s(36) : s(72);
  const rankSize = size === 'sm' ? t(16) : t(28);

  return StyleSheet.create({
    wrap: {
      width: dim,
      height: dim,
      borderRadius: dim / 2,
      borderWidth: size === 'sm' ? 2 : 2.5,
      backgroundColor: figmaColors.cream,
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: hasLabel ? s(2) : 0
    },
    label: {
      fontFamily: appFonts.accent,
      fontSize: tb(size === 'sm' ? 6 : 8),
      color: figmaColors.gray,
      textTransform: 'uppercase',
      letterSpacing: 0.4,
      textAlign: 'center',
      marginBottom: -s(2)
    },
    rank: {
      fontFamily: appFonts.display,
      fontSize: rankSize,
      lineHeight: rankSize + 2
    },
    rankCompact: {
      fontSize: rankSize - 4,
      lineHeight: rankSize - 2
    },
    rankTight: {
      fontSize: rankSize - 8,
      lineHeight: rankSize - 6
    }
  });
}
