/** "How points work" mini-table between the ranking list and the CTA card. */
import React from 'react';
import { appFonts } from '@/constants/appFonts';
import { StyleSheet, Text, View } from 'react-native';
import { leaderboardCopy } from '@/constants/leaderboardCopy';
import { figmaColors } from '@/constants/figmaColors';
import { bodyText } from '@/constants/appTypography';

type ExplainerProps = {
  s: (n: number) => number;
  t: (n: number) => number;
};

export function LeaderboardPointsExplainer({ s, t }: ExplainerProps) {
  const styles = createStyles(s, t);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>HOW POINTS WORK</Text>
      {leaderboardCopy.pointsEvents.map((item, idx) => (
        <View
          key={item.label}
          style={[styles.row, idx < leaderboardCopy.pointsEvents.length - 1 && styles.rowDivider]}
        >
          <Text style={styles.label}>{item.label}</Text>
          <Text style={styles.pts}>{item.points}</Text>
        </View>
      ))}
    </View>
  );
}

function createStyles(s: (n: number) => number, t: (n: number) => number) {
  const tb = (n: number) => bodyText(t, n);

  return StyleSheet.create({
    card: {
      backgroundColor: figmaColors.cream,
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      borderRadius: s(12),
      marginVertical: s(10),
      paddingHorizontal: s(16),
      paddingBottom: s(8)
    },
    title: {
      fontFamily: appFonts.display,
      fontSize: t(16),
      color: figmaColors.charcoal,
      marginTop: s(12),
      marginBottom: s(8)
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: s(9)
    },
    rowDivider: {
      borderBottomWidth: 1,
      borderBottomColor: figmaColors.divider
    },
    label: {
      fontFamily: appFonts.body,
      fontSize: tb(17),
      lineHeight: tb(21),
      color: figmaColors.charcoal,
      flex: 1
    },
    pts: {
      fontFamily: appFonts.bodyBold,
      fontSize: tb(16),
      color: figmaColors.textAccent,
      letterSpacing: 0.4
    }
  });
}
