import React, { useMemo } from 'react';
import { appFonts } from '@/constants/appFonts';
import { Image, StyleSheet, Text, View } from 'react-native';
import { BREAKDOWN_ICONS } from '@/constants/leaderboardAssets';
import { figmaColors } from '@/constants/figmaColors';
import { bodyText } from '@/constants/appTypography';
import { formatPoints } from '@/lib/leaderboard';
import type { PointBreakdownGroup } from '@/lib/leaderboard';
import { ProfilePointsDonut } from '@/components/profile/ProfilePointsDonut';

type Props = {
  groups: PointBreakdownGroup[];
  totalPoints: number;
  s: (n: number) => number;
  t: (n: number) => number;
};

const GROUP_LABELS: Record<string, string> = {
  auth: 'Authentications',
  research: 'Research',
  forum: 'Discussions',
  other: 'Other Activities'
};

export function ProfilePointsBreakdown({ groups, totalPoints, s, t }: Props) {
  const styles = useMemo(() => createStyles(s, t), [s, t]);
  const max = Math.max(...groups.map((g) => Math.abs(g.points)), 1);
  const total = Math.max(totalPoints, groups.reduce((sum, g) => sum + Math.abs(g.points), 0), 1);
  const donutSize = s(128);

  if (groups.length === 0) return null;

  return (
    <View style={styles.wrap}>
      <View style={styles.barsCol}>
        {groups.map((group) => {
          const widthPct = Math.max(8, (Math.abs(group.points) / max) * 100);
          const sharePct = Math.round((Math.abs(group.points) / total) * 100);
          const icon = BREAKDOWN_ICONS[group.key as keyof typeof BREAKDOWN_ICONS] ?? BREAKDOWN_ICONS.other;
          const label = GROUP_LABELS[group.key] ?? group.label;

          return (
            <View key={group.key} style={styles.row}>
              <Image source={icon} style={styles.icon} resizeMode="contain" />
              <View style={styles.rowBody}>
                <View style={styles.labelCol}>
                  <Text style={styles.label}>{label}</Text>
                  <View style={styles.valueCol}>
                    <Text style={[styles.value, group.points < 0 && styles.valueNeg]}>
                      {formatPoints(group.points)} PTS
                    </Text>
                    <Text style={styles.pct}>{sharePct}%</Text>
                  </View>
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
            </View>
          );
        })}
      </View>

      <View style={styles.donutCol}>
        <ProfilePointsDonut groups={groups} totalPoints={totalPoints} size={donutSize} t={t} />
      </View>
    </View>
  );
}

function createStyles(s: (n: number) => number, t: (n: number) => number) {
  const tb = (n: number) => bodyText(t, n);

  return StyleSheet.create({
    wrap: {
      flexDirection: 'row',
      gap: s(10),
      backgroundColor: figmaColors.cream,
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      borderRadius: s(14),
      padding: s(12),
      alignItems: 'center'
    },
    barsCol: {
      flex: 1,
      gap: s(10),
      minWidth: 0
    },
    row: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: s(8)
    },
    icon: {
      width: s(34),
      height: s(34),
      marginTop: s(2)
    },
    rowBody: {
      flex: 1,
      gap: s(4)
    },
    labelCol: {
      gap: s(1)
    },
    label: {
      fontFamily: appFonts.accent,
      fontSize: tb(11),
      color: figmaColors.gray,
      textTransform: 'uppercase',
      letterSpacing: 0.6
    },
    valueCol: {
      flexDirection: 'row',
      alignItems: 'baseline',
      gap: s(6)
    },
    value: {
      fontFamily: appFonts.bodyBold,
      fontSize: tb(16),
      color: figmaColors.charcoal
    },
    valueNeg: {
      color: figmaColors.error
    },
    pct: {
      fontFamily: appFonts.body,
      fontSize: tb(13),
      color: figmaColors.textAccent
    },
    barTrack: {
      height: s(6),
      backgroundColor: figmaColors.stone,
      borderRadius: s(3),
      overflow: 'hidden'
    },
    barFill: {
      height: '100%',
      backgroundColor: figmaColors.accentStrong,
      borderRadius: s(3)
    },
    barFillNeg: {
      backgroundColor: figmaColors.error
    },
    donutCol: {
      flexShrink: 0,
      alignItems: 'center',
      justifyContent: 'center'
    }
  });
}
