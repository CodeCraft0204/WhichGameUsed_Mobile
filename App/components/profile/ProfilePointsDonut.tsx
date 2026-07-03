import React, { useMemo } from 'react';
import Svg, { Circle, G } from 'react-native-svg';
import { appFonts } from '@/constants/appFonts';
import { Image, StyleSheet, Text, View } from 'react-native';
import { leaderboardAssets } from '@/constants/leaderboardAssets';
import { figmaColors } from '@/constants/figmaColors';
import { bodyText } from '@/constants/appTypography';
import { formatPoints } from '@/lib/leaderboard';
import type { PointBreakdownGroup } from '@/lib/leaderboard';

const SEGMENT_COLORS = ['#8B7355', '#A0724E', '#B8956A', '#C9A84C'];

type Props = {
  groups: PointBreakdownGroup[];
  totalPoints: number;
  size: number;
  t: (n: number) => number;
};

export function ProfilePointsDonut({ groups, totalPoints, size, t }: Props) {
  const styles = useMemo(() => createStyles(t), [t]);
  const stroke = size * 0.14;
  const cx = size / 2;
  const cy = size / 2;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  const activeGroups = groups.filter((g) => Math.abs(g.points) > 0);
  const chartTotal =
    activeGroups.reduce((sum, g) => sum + Math.abs(g.points), 0) || Math.max(Math.abs(totalPoints), 1);

  let cumulative = 0;

  return (
    <View style={[styles.wrap, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <G transform={`rotate(-90 ${cx} ${cy})`}>
          <Circle
            cx={cx}
            cy={cy}
            r={radius}
            stroke={figmaColors.stone}
            strokeWidth={stroke}
            fill="none"
          />
          {activeGroups.map((group, idx) => {
            const share = Math.abs(group.points) / chartTotal;
            const dash = circumference * share;
            const gap = Math.max(circumference - dash, 0.001);
            const segment = (
              <Circle
                key={group.key}
                cx={cx}
                cy={cy}
                r={radius}
                stroke={SEGMENT_COLORS[idx % SEGMENT_COLORS.length]}
                strokeWidth={stroke}
                fill="none"
                strokeDasharray={`${dash} ${gap}`}
                strokeDashoffset={-cumulative}
                strokeLinecap="butt"
              />
            );
            cumulative += dash;
            return segment;
          })}
        </G>
      </Svg>
      <View style={styles.center} pointerEvents="none">
        <Image source={leaderboardAssets.ctaTrophy} style={styles.trophy} resizeMode="contain" />
        <Text style={styles.pts}>{formatPoints(totalPoints)}</Text>
        <Text style={styles.ptsLabel}>PTS</Text>
      </View>
    </View>
  );
}

function createStyles(t: (n: number) => number) {
  const tb = (n: number) => bodyText(t, n);

  return StyleSheet.create({
    wrap: {
      alignItems: 'center',
      justifyContent: 'center'
    },
    center: {
      ...StyleSheet.absoluteFillObject,
      alignItems: 'center',
      justifyContent: 'center'
    },
    trophy: {
      width: tb(22),
      height: tb(22),
      marginBottom: 2,
      opacity: 0.85
    },
    pts: {
      fontFamily: appFonts.bodyBold,
      fontSize: tb(14),
      color: figmaColors.charcoal
    },
    ptsLabel: {
      fontFamily: appFonts.accent,
      fontSize: tb(8),
      color: figmaColors.gray,
      letterSpacing: 0.6
    }
  });
}
