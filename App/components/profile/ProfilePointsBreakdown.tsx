import React, { useMemo } from 'react';
import { appFonts } from '@/constants/appFonts';
import { StyleSheet, Text, View } from 'react-native';
import { figmaColors } from '@/constants/figmaColors';
import { bodyText } from '@/constants/appTypography';
import { formatPoints } from '@/lib/leaderboard';
import type { PointBreakdownGroup } from '@/lib/leaderboard';

type Props = {
  groups: PointBreakdownGroup[];
  totalPoints: number;
  s: (n: number) => number;
  t: (n: number) => number;
};

export function ProfilePointsBreakdown({ groups, totalPoints, s, t }: Props) {
  const styles = useMemo(() => createStyles(s, t), [s, t]);
  const max = Math.max(...groups.map((g) => Math.abs(g.points)), 1);

  if (groups.length === 0) return null;

  return (
    <View style={styles.wrap}>
      {groups.map((group) => {
        const widthPct = Math.max(8, (Math.abs(group.points) / max) * 100);
        return (
          <View key={group.key} style={styles.row}>
            <View style={styles.labelCol}>
              <Text style={styles.label}>{group.label}</Text>
              <Text style={[styles.value, group.points < 0 && styles.valueNeg]}>
                {group.points > 0 ? '+' : ''}
                {formatPoints(group.points)}
              </Text>
            </View>
            <View style={styles.barTrack}>
              <View
                style={[
                  styles.barFill,
                  { width: `${widthPct}%` },
                  group.points < 0 && styles.barFillNeg
                ]}
              />
            </View>
          </View>
        );
      })}
      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalValue}>{formatPoints(totalPoints)} PTS</Text>
      </View>
    </View>
  );
}

function createStyles(s: (n: number) => number, t: (n: number) => number) {
  const tb = (n: number) => bodyText(t, n);

  return StyleSheet.create({
    wrap: {
      gap: s(12)
    },
    row: {
      gap: s(6)
    },
    labelCol: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'baseline'
    },
    label: {
      fontFamily: appFonts.body,
      fontSize: tb(16),
      color: figmaColors.charcoal
    },
    value: {
      fontFamily: appFonts.bodyBold,
      fontSize: tb(15),
      color: figmaColors.textAccent
    },
    valueNeg: {
      color: figmaColors.error
    },
    barTrack: {
      height: s(8),
      backgroundColor: figmaColors.stone,
      borderRadius: s(4),
      overflow: 'hidden'
    },
    barFill: {
      height: '100%',
      backgroundColor: figmaColors.accent,
      borderRadius: s(4)
    },
    barFillNeg: {
      backgroundColor: figmaColors.error
    },
    totalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      borderTopWidth: 1,
      borderTopColor: figmaColors.divider,
      paddingTop: s(10),
      marginTop: s(4)
    },
    totalLabel: {
      fontFamily: appFonts.accent,
      fontSize: tb(11),
      color: figmaColors.gray,
      textTransform: 'uppercase',
      letterSpacing: 0.8
    },
    totalValue: {
      fontFamily: appFonts.bodyBold,
      fontSize: tb(17),
      color: figmaColors.charcoal
    }
  });
}
