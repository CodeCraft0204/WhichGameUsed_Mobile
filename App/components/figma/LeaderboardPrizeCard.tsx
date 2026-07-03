import React, { useMemo } from 'react';
import { appFonts } from '@/constants/appFonts';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { leaderboardCopy } from '@/constants/leaderboardCopy';
import { figmaColors } from '@/constants/figmaColors';
import { bodyText } from '@/constants/appTypography';
import { buildPrizeCardDisplay } from '@/lib/prize-display';
import type { MonthlyPrize } from '@/lib/leaderboard';

type Props = {
  prize: MonthlyPrize | null;
  s: (n: number) => number;
  t: (n: number) => number;
  onLearnMore?: () => void;
};

export function LeaderboardPrizeCard({ prize, s, t, onLearnMore }: Props) {
  const styles = useMemo(() => createStyles(s, t), [s, t]);
  const display = useMemo(() => buildPrizeCardDisplay(prize), [prize]);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{display.sectionLabel}</Text>
      <Text style={styles.body}>{display.prizeName}</Text>
      {display.summary ? <Text style={styles.summary}>{display.summary}</Text> : null}

      {onLearnMore ? (
        <Pressable
          onPress={onLearnMore}
          accessibilityRole="button"
          style={({ pressed }) => [styles.learnRow, pressed && styles.learnPressed]}
        >
          <Text style={styles.learnText}>{leaderboardCopy.prizeLearnMore}</Text>
          <Ionicons name="chevron-forward" size={s(14)} color={figmaColors.navActive} />
        </Pressable>
      ) : null}
    </View>
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
      minWidth: 0,
      justifyContent: 'center'
    },
    title: {
      fontFamily: appFonts.display,
      fontSize: t(13),
      lineHeight: t(15),
      color: figmaColors.charcoal,
      textTransform: 'uppercase',
      letterSpacing: 0.8
    },
    body: {
      fontFamily: appFonts.display,
      fontSize: t(18),
      lineHeight: t(22),
      color: figmaColors.charcoal
    },
    summary: {
      fontFamily: appFonts.body,
      fontSize: tb(13),
      lineHeight: tb(18),
      color: figmaColors.gray,
      marginTop: s(4),
      marginBottom: s(8)
    },
    learnRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(2),
      alignSelf: 'flex-start',
      marginTop: s(4)
    },
    learnPressed: {
      opacity: 0.85
    },
    learnText: {
      fontFamily: appFonts.accent,
      fontSize: tb(12),
      color: figmaColors.navActive,
      letterSpacing: 0.4
    }
  });
}
