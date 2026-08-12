import React, { useMemo } from 'react';
import { appFonts } from '@/constants/appFonts';
import { Image, StyleSheet, Text, View, type ImageSourcePropType } from 'react-native';
import { BREAKDOWN_ICONS } from '@/constants/leaderboardAssets';
import { bodyText } from '@/constants/appTypography';
import { figmaColors } from '@/constants/figmaColors';
import { PointsRuleRow } from '@/components/points-work/PointsRuleRow';
import type { LeaderboardPointRule } from '@/lib/leaderboard';

type Props = {
  title: string;
  groupKey: string;
  rules: LeaderboardPointRule[];
  s: (n: number) => number;
  t: (n: number) => number;
  footerNote?: string;
};

const GROUP_ICONS: Record<string, ImageSourcePropType> = {
  auth: BREAKDOWN_ICONS.auth,
  research: BREAKDOWN_ICONS.research,
  forum: BREAKDOWN_ICONS.forum,
  other: BREAKDOWN_ICONS.other
};

export function PointsCategorySection({ title, groupKey, rules, footerNote, s, t }: Props) {
  const styles = useMemo(() => createStyles(s, t), [s, t]);
  const icon = GROUP_ICONS[groupKey] ?? BREAKDOWN_ICONS.other;

  if (rules.length === 0) return null;

  return (
    <View style={styles.panel}>
      <View style={styles.header}>
        <Image source={icon} style={styles.icon} resizeMode="contain" />
        <Text style={styles.title}>{title}</Text>
      </View>
      {rules.map((rule) => (
        <PointsRuleRow key={rule.eventType} rule={rule} s={s} t={t} />
      ))}
      {footerNote ? <Text style={styles.footer}>{footerNote}</Text> : null}
    </View>
  );
}

function createStyles(s: (n: number) => number, t: (n: number) => number) {
  const tb = (n: number) => bodyText(t, n);

  return StyleSheet.create({
    panel: {
      backgroundColor: figmaColors.cream,
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      borderRadius: s(14),
      paddingHorizontal: s(14),
      paddingBottom: s(12),
      marginBottom: s(12)
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(8),
      paddingTop: s(14),
      paddingBottom: s(4)
    },
    icon: {
      width: s(28),
      height: s(28)
    },
    title: {
      fontFamily: appFonts.accent,
      fontSize: tb(13),
      color: figmaColors.charcoal,
      letterSpacing: 0.8,
      textTransform: 'uppercase'
    },
    footer: {
      fontFamily: appFonts.body,
      fontSize: tb(13),
      lineHeight: tb(18),
      color: figmaColors.gray,
      marginTop: s(8),
      paddingTop: s(8),
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: figmaColors.divider
    }
  });
}
