import React, { useMemo } from 'react';
import { Image, StyleSheet, Text, View, type ImageSourcePropType } from 'react-native';
import { appFonts } from '@/constants/appFonts';
import { mostWantedIcons } from '@/constants/mostWantedContent';
import { figmaColors } from '@/constants/figmaColors';

type WantedStatsRowProps = {
  activeHunts: number;
  solvedThisMonth: number;
  contributorCount: number;
  s: (n: number) => number;
  t: (n: number) => number;
};

function StatItem({
  icon,
  text,
  s,
  t
}: {
  icon: ImageSourcePropType;
  text: string;
  s: (n: number) => number;
  t: (n: number) => number;
}) {
  const styles = useMemo(() => createItemStyles(s, t), [s, t]);
  return (
    <View style={styles.item}>
      <Image source={icon} style={styles.icon} resizeMode="contain" />
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

/** Inline stat strip — "24 active requests • 8 near solved • 312 contributors". */
export function WantedStatsRow({ activeHunts, solvedThisMonth, contributorCount, s, t }: WantedStatsRowProps) {
  const styles = useMemo(() => createStyles(s), [s]);
  return (
    <View style={styles.row}>
      <StatItem icon={mostWantedIcons.statTarget} text={`${activeHunts} active cards`} s={s} t={t} />
      <View style={styles.dot} />
      <StatItem icon={mostWantedIcons.statPuzzle} text={`${solvedThisMonth} solved`} s={s} t={t} />
      <View style={styles.dot} />
      <StatItem
        icon={mostWantedIcons.statContributors}
        text={`${contributorCount} contributors`}
        s={s}
        t={t}
      />
    </View>
  );
}

function createStyles(s: (n: number) => number) {
  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: s(6),
      paddingHorizontal: s(2),
      marginBottom: s(14)
    },
    dot: {
      width: s(4),
      height: s(4),
      borderRadius: s(2),
      backgroundColor: figmaColors.taupeLight
    }
  });
}

function createItemStyles(s: (n: number) => number, t: (n: number) => number) {
  return StyleSheet.create({
    item: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(5)
    },
    icon: {
      width: s(14),
      height: s(14)
    },
    text: {
      fontFamily: appFonts.bodyBold,
      fontSize: t(12),
      color: figmaColors.brownMuted
    }
  });
}
