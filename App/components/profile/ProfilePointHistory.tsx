import React, { useMemo } from 'react';
import { appFonts } from '@/constants/appFonts';
import { Image, StyleSheet, Text, View } from 'react-native';
import { leaderboardEventLabel } from '@/constants/leaderboardEventLabels';
import { BREAKDOWN_ICONS } from '@/constants/leaderboardAssets';
import { figmaColors } from '@/constants/figmaColors';
import { bodyText } from '@/constants/appTypography';
import { formatPoints, formatRelativeTime } from '@/lib/leaderboard';
import { eventCategoryLabel, eventGroupKey } from '@/lib/leaderboard-ui';
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
      {events.map((ev, idx) => {
        const groupKey = eventGroupKey(ev.eventType);
        const icon = BREAKDOWN_ICONS[groupKey];

        return (
          <View key={ev.id}>
            <View style={styles.row}>
              <Image source={icon} style={styles.icon} resizeMode="contain" />
              <View style={styles.body}>
                <Text style={styles.title} numberOfLines={2}>
                  {ev.reason?.trim() || leaderboardEventLabel(ev.eventType)}
                </Text>
                <Text style={styles.category}>{eventCategoryLabel(ev.eventType)}</Text>
              </View>
              <View style={styles.meta}>
                <Text style={[styles.points, ev.points < 0 && styles.pointsNeg]}>
                  {ev.points > 0 ? '+' : ''}
                  {formatPoints(ev.points)} PTS
                </Text>
                <Text style={styles.time}>{formatRelativeTime(ev.createdAt)}</Text>
              </View>
            </View>
            {idx < events.length - 1 ? <View style={styles.divider} /> : null}
          </View>
        );
      })}
    </View>
  );
}

function createStyles(s: (n: number) => number, t: (n: number) => number) {
  const tb = (n: number) => bodyText(t, n);

  return StyleSheet.create({
    list: {
      backgroundColor: figmaColors.cream,
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      borderRadius: s(14),
      paddingHorizontal: s(12),
      paddingVertical: s(4)
    },
    row: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: s(10),
      paddingVertical: s(12)
    },
    icon: {
      width: s(36),
      height: s(36),
      flexShrink: 0,
      marginTop: s(2)
    },
    body: {
      flex: 1,
      gap: s(2),
      minWidth: 0
    },
    title: {
      fontFamily: appFonts.bodyBold,
      fontSize: tb(16),
      lineHeight: tb(20),
      color: figmaColors.charcoal
    },
    category: {
      fontFamily: appFonts.body,
      fontSize: tb(14),
      color: figmaColors.gray
    },
    meta: {
      alignItems: 'flex-end',
      flexShrink: 0,
      gap: s(2)
    },
    points: {
      fontFamily: appFonts.bodyBold,
      fontSize: tb(15),
      color: figmaColors.textAccent
    },
    pointsNeg: {
      color: figmaColors.error
    },
    time: {
      fontFamily: appFonts.body,
      fontSize: tb(13),
      color: figmaColors.grayMuted
    },
    divider: {
      height: 1,
      backgroundColor: figmaColors.divider
    }
  });
}
