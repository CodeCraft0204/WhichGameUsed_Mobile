import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { appFonts } from '@/constants/appFonts';
import { bodyText, broadsheetAccent } from '@/constants/appTypography';
import { databaseCopy } from '@/constants/databaseCopy';
import { figmaColors } from '@/constants/figmaColors';

type DatabaseStatsBarProps = {
  totalCards: number;
  authenticatedCards: number;
  s: (n: number) => number;
  t: (n: number) => number;
};

export function DatabaseStatsBar({
  totalCards,
  authenticatedCards,
  s,
  t
}: DatabaseStatsBarProps) {
  const styles = useMemo(() => createStyles(s, t), [s, t]);

  return (
    <View style={styles.wrap}>
      <Text style={styles.primary}>{databaseCopy.statsAuthenticated(authenticatedCards)}</Text>
      <Text style={styles.secondary}>{databaseCopy.statsTotal(totalCards)}</Text>
    </View>
  );
}

function createStyles(s: (n: number) => number, t: (n: number) => number) {
  const tb = (n: number) => bodyText(t, n);

  return StyleSheet.create({
    wrap: {
      marginTop: s(16),
      marginBottom: s(8),
      paddingBottom: s(8)
    },
    primary: {
      fontFamily: appFonts.body,
      fontSize: tb(22),
      lineHeight: tb(28),
      color: figmaColors.charcoal,
      ...broadsheetAccent,
      letterSpacing: 0.8
    },
    secondary: {
      marginTop: s(4),
      fontFamily: appFonts.body,
      fontSize: tb(18),
      color: figmaColors.gray
    }
  });
}
