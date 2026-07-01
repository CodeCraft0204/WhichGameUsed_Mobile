import React, { useMemo } from 'react';
import { appFonts } from '@/constants/appFonts';
import { StyleSheet, Text, View } from 'react-native';
import { leaderboardEventLabel } from '@/constants/leaderboardEventLabels';
import { figmaColors } from '@/constants/figmaColors';
import { bodyText } from '@/constants/appTypography';
import { formatPoints, formatRelativeTime } from '@/lib/leaderboard';
import type { PointEvent } from '@/lib/leaderboard';

type Props = {
  events: PointEvent[];
  s: (n: number) => number;
  t: (n: number) => number;
};

export function ProfilePointHistory({ events, s, t }: Props) {
  const styles = useMemo(() => createStyles(s, t), [s, t]);

  if (events.length === 0) return null;

  return (
    <View style={styles.list}>
      {events.map((ev) => (
        <View key={ev.id} style={styles.row}>
          <View style={styles.dot} />
          <View style={styles.body}>
            <Text style={styles.title}>{leaderboardEventLabel(ev.eventType)}</Text>
            {ev.reason ? (
              <Text style={styles.reason} numberOfLines={2}>{ev.reason}</Text>
            ) : null}
            <Text style={styles.time}>{formatRelativeTime(ev.createdAt)}</Text>
          </View>
          <Text style={[styles.points, ev.points < 0 && styles.pointsNeg]}>
            {ev.points > 0 ? '+' : ''}
            {formatPoints(ev.points)}
          </Text>
        </View>
      ))}
    </View>
  );
}

function createStyles(s: (n: number) => number, t: (n: number) => number) {
  const tb = (n: number) => bodyText(t, n);

  return StyleSheet.create({
    list: {
      gap: s(10)
    },
    row: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: s(10),
      backgroundColor: figmaColors.cream,
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      borderRadius: s(12),
      padding: s(12)
    },
    dot: {
      width: s(8),
      height: s(8),
      borderRadius: s(4),
      backgroundColor: figmaColors.accent,
      marginTop: s(6)
    },
    body: {
      flex: 1,
      gap: s(2)
    },
    title: {
      fontFamily: appFonts.bodyBold,
      fontSize: tb(16),
      lineHeight: tb(20),
      color: figmaColors.charcoal
    },
    reason: {
      fontFamily: appFonts.body,
      fontSize: tb(14),
      lineHeight: tb(18),
      color: figmaColors.gray
    },
    time: {
      fontFamily: appFonts.body,
      fontSize: tb(12),
      color: figmaColors.grayMuted,
      marginTop: s(2)
    },
    points: {
      fontFamily: appFonts.bodyBold,
      fontSize: tb(15),
      color: figmaColors.textAccent,
      flexShrink: 0
    },
    pointsNeg: {
      color: figmaColors.error
    }
  });
}
