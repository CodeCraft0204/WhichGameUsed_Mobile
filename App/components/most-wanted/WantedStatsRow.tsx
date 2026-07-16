import React, { useMemo } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { appFonts } from '@/constants/appFonts';
import { figmaIcons } from '@/constants/figmaIcons';
import { figmaColors } from '@/constants/figmaColors';
import { mostWantedCopy } from '@/constants/mostWantedCopy';

type WantedStatsRowProps = {
  activeHunts: number;
  solvedThisMonth: number;
  contributorCount: number;
  s: (n: number) => number;
  t: (n: number) => number;
};

function StatCard({
  icon,
  label,
  value,
  s,
  t
}: {
  icon: number;
  label: string;
  value: string;
  s: (n: number) => number;
  t: (n: number) => number;
}) {
  const styles = useMemo(() => createCardStyles(s, t), [s, t]);
  return (
    <View style={styles.card}>
      <Image source={icon} style={styles.icon} resizeMode="contain" />
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

export function WantedStatsRow({ activeHunts, solvedThisMonth, contributorCount, s, t }: WantedStatsRowProps) {
  const styles = useMemo(() => createStyles(s), [s]);
  return (
    <View style={styles.row}>
      <StatCard
        icon={figmaIcons.metaShield}
        label={mostWantedCopy.statsActive}
        value={String(activeHunts)}
        s={s}
        t={t}
      />
      <StatCard
        icon={figmaIcons.sealApproved}
        label={mostWantedCopy.statsSolved}
        value={String(solvedThisMonth)}
        s={s}
        t={t}
      />
      <StatCard
        icon={figmaIcons.metaPerson}
        label={mostWantedCopy.statsContributors}
        value={String(contributorCount)}
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
      gap: s(8),
      marginBottom: s(16)
    }
  });
}

function createCardStyles(s: (n: number) => number, t: (n: number) => number) {
  return StyleSheet.create({
    card: {
      flex: 1,
      backgroundColor: figmaColors.cream,
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      borderRadius: s(10),
      paddingVertical: s(10),
      paddingHorizontal: s(8),
      alignItems: 'center',
      gap: s(4)
    },
    icon: {
      width: s(22),
      height: s(22)
    },
    label: {
      fontFamily: appFonts.body,
      fontSize: t(10),
      lineHeight: t(12),
      color: figmaColors.gray,
      textAlign: 'center'
    },
    value: {
      fontFamily: appFonts.body,
      fontSize: t(18),
      lineHeight: t(22),
      color: figmaColors.charcoal
    }
  });
}
