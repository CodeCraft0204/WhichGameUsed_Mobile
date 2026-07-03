import React, { useMemo } from 'react';
import { appFonts } from '@/constants/appFonts';
import { StyleSheet, Text, View } from 'react-native';
import { bodyText } from '@/constants/appTypography';
import { figmaColors } from '@/constants/figmaColors';
import {
  formatDailyCap,
  formatPointDelta,
  shortRuleDescription
} from '@/lib/points-work';
import type { LeaderboardPointRule } from '@/lib/leaderboard';

type Props = {
  rule: LeaderboardPointRule;
  s: (n: number) => number;
  t: (n: number) => number;
};

export function PointsRuleRow({ rule, s, t }: Props) {
  const styles = useMemo(() => createStyles(s, t), [s, t]);
  const isNegative = rule.basePoints < 0;
  const isManual = rule.eventType === 'admin_adjustment';
  const capLabel = formatDailyCap(rule.dailyCap);

  return (
    <View style={styles.row}>
      <View style={styles.main}>
        <Text style={styles.label}>{rule.label}</Text>
        <Text style={styles.description}>{shortRuleDescription(rule)}</Text>
        {capLabel ? <Text style={styles.cap}>{capLabel}</Text> : null}
      </View>
      {isManual ? (
        <View style={styles.badgeManual}>
          <Text style={styles.badgeManualText}>Manual</Text>
        </View>
      ) : (
        <View style={[styles.badge, isNegative && styles.badgeNeg]}>
          <Text style={[styles.badgeText, isNegative && styles.badgeTextNeg]}>
            {formatPointDelta(rule.basePoints)}
          </Text>
        </View>
      )}
    </View>
  );
}

function createStyles(s: (n: number) => number, t: (n: number) => number) {
  const tb = (n: number) => bodyText(t, n);

  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: s(10),
      paddingVertical: s(10),
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: figmaColors.divider
    },
    main: {
      flex: 1,
      gap: s(3),
      minWidth: 0
    },
    label: {
      fontFamily: appFonts.bodyBold,
      fontSize: tb(15),
      color: figmaColors.charcoal
    },
    description: {
      fontFamily: appFonts.body,
      fontSize: tb(14),
      lineHeight: tb(19),
      color: figmaColors.gray
    },
    cap: {
      fontFamily: appFonts.accent,
      fontSize: tb(10),
      color: figmaColors.textAccent,
      letterSpacing: 0.5,
      textTransform: 'uppercase',
      marginTop: s(2)
    },
    badge: {
      backgroundColor: 'rgba(201, 168, 76, 0.15)',
      borderRadius: s(8),
      paddingHorizontal: s(8),
      paddingVertical: s(5),
      flexShrink: 0
    },
    badgeNeg: {
      backgroundColor: 'rgba(180, 60, 50, 0.1)'
    },
    badgeText: {
      fontFamily: appFonts.bodyBold,
      fontSize: tb(13),
      color: '#9A7B2E'
    },
    badgeTextNeg: {
      color: figmaColors.error
    },
    badgeManual: {
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      borderRadius: s(8),
      paddingHorizontal: s(8),
      paddingVertical: s(5),
      flexShrink: 0
    },
    badgeManualText: {
      fontFamily: appFonts.accent,
      fontSize: tb(10),
      color: figmaColors.gray,
      letterSpacing: 0.4,
      textTransform: 'uppercase'
    }
  });
}
