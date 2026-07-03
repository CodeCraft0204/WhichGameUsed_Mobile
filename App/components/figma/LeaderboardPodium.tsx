/**
 * Top 3 collectors — minimal horizontal tiles on a parchment panel.
 */
import React, { useMemo } from 'react';
import { appFonts } from '@/constants/appFonts';
import { Platform, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { PodiumUserTile, type PodiumRank } from '@/components/figma/PodiumUserTile';
import { leaderboardCopy } from '@/constants/leaderboardCopy';
import { bodyText } from '@/constants/appTypography';
import { figmaColors } from '@/constants/figmaColors';
import type { LeaderboardEntry } from '@/lib/leaderboard';

type Props = {
  top3: LeaderboardEntry[];
  currentUserId?: string | null;
  onPressUser?: (entry: LeaderboardEntry) => void;
  s: (n: number) => number;
  t: (n: number) => number;
};

const DISPLAY_ORDER: PodiumRank[] = [2, 1, 3];

function softShadow(): ViewStyle {
  return Platform.select({
    ios: {
      shadowColor: figmaColors.ink,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 4
    },
    android: { elevation: 2 },
    default: {}
  }) as ViewStyle;
}

function resolveSlots(top3: LeaderboardEntry[]) {
  const first = top3[0] ?? null;
  const second = top3[1] ?? null;
  const third = top3[2] ?? null;

  const byRank: Record<PodiumRank, LeaderboardEntry | null> = {
    1: first?.rank === 1 ? first : top3.find((e) => e.rank === 1) ?? first,
    2: second?.rank === 2 ? second : top3.find((e) => e.rank === 2) ?? second,
    3: third?.rank === 3 ? third : top3.find((e) => e.rank === 3) ?? third
  };

  return DISPLAY_ORDER.map((rank) => ({ rank, entry: byRank[rank] }));
}

export function LeaderboardPodium({ top3, currentUserId, onPressUser, s, t }: Props) {
  const styles = useMemo(() => createStyles(s, t), [s, t]);
  const slots = useMemo(() => resolveSlots(top3), [top3]);

  if (top3.length === 0) return null;

  return (
    <View style={[styles.panel, softShadow()]}>
      <Text style={styles.title}>{leaderboardCopy.topCollectorsTitle}</Text>
      <Text style={styles.subtitle}>{leaderboardCopy.topCollectorsSubtitle}</Text>

      <View style={styles.row}>
        {slots.map(({ rank, entry }) =>
          entry ? (
            <PodiumUserTile
              key={entry.userId}
              entry={entry}
              rank={rank}
              isSelf={currentUserId != null && entry.userId === currentUserId}
              onPress={onPressUser ? () => onPressUser(entry) : undefined}
              s={s}
              t={t}
            />
          ) : (
            <View
              key={`empty-${rank}`}
              style={[styles.emptySlot, { flex: rank === 1 ? 1.12 : 1 }]}
              accessibilityElementsHidden
            />
          )
        )}
      </View>
    </View>
  );
}

function createStyles(s: (n: number) => number, t: (n: number) => number) {
  const tb = (n: number) => bodyText(t, n);

  return StyleSheet.create({
    panel: {
      backgroundColor: figmaColors.cream,
      borderWidth: StyleSheet.hairlineWidth * 2,
      borderColor: figmaColors.borderLight,
      borderRadius: s(14),
      paddingTop: s(14),
      paddingBottom: s(12),
      paddingHorizontal: s(10),
      marginBottom: s(18)
    },
    title: {
      fontFamily: appFonts.accent,
      fontSize: tb(13),
      color: figmaColors.gray,
      letterSpacing: 1.1,
      textTransform: 'uppercase',
      textAlign: 'center'
    },
    subtitle: {
      fontFamily: appFonts.body,
      fontSize: tb(14),
      lineHeight: tb(18),
      color: figmaColors.textMuted,
      textAlign: 'center',
      marginTop: s(4),
      marginBottom: s(10)
    },
    row: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'center'
    },
    emptySlot: {
      minWidth: s(8)
    }
  });
}
