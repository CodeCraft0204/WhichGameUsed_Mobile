import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { appFonts } from '@/constants/appFonts';
import { bodyText } from '@/constants/appTypography';
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
      <Text style={styles.line} numberOfLines={1}>
        {databaseCopy.statsLine(authenticatedCards, totalCards)}
      </Text>
    </View>
  );
}

function createStyles(s: (n: number) => number, t: (n: number) => number) {
  const tb = (n: number) => bodyText(t, n);

  return StyleSheet.create({
    wrap: {
      marginTop: s(10),
      marginBottom: s(6),
      paddingBottom: s(4)
    },
    line: {
      fontFamily: appFonts.body,
      fontSize: tb(18),
      lineHeight: tb(18),
      color: figmaColors.gray
    }
  });
}
