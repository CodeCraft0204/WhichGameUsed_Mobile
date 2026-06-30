/**
 * Top-3 podium: #2 left | #1 center (raised) | #3 right.
 * Each slot shows a medal circle, ProfileAvatar, name, and points.
 */
import React from 'react';
import { appFonts } from '@/constants/appFonts';
import { StyleSheet, Text, View } from 'react-native';
import { ProfileAvatar } from '@/components/profile/ProfileAvatar';
import { formatPoints } from '@/lib/leaderboard';
import type { LeaderboardEntry } from '@/lib/leaderboard';
import { figmaColors } from '@/constants/figmaColors';
import { bodyText } from '@/constants/appTypography';

type PodiumProps = {
  top3: LeaderboardEntry[];
  currentUserId?: string | null;
  onPressUser?: (entry: LeaderboardEntry) => void;
  s: (n: number) => number;
  t: (n: number) => number;
};

const MEDAL_COLORS = {
  1: { bg: '#C9A84C', text: figmaColors.cream, border: '#A8832A' },
  2: { bg: '#A0A0A8', text: figmaColors.cream, border: '#808088' },
  3: { bg: '#A0724E', text: figmaColors.cream, border: '#7A5230' }
} as const;

export function LeaderboardPodium({ top3, currentUserId, onPressUser, s, t }: PodiumProps) {
  const styles = createStyles(s, t);

  // Podium order: 2nd | 1st | 3rd
  const podiumOrder = [top3[1], top3[0], top3[2]].filter(Boolean) as LeaderboardEntry[];

  if (podiumOrder.length === 0) return null;

  return (
    <View style={styles.podium}>
      {podiumOrder.map((entry) => {
        const rank = entry.rank as 1 | 2 | 3;
        const isFirst = rank === 1;
        const medal = MEDAL_COLORS[rank] ?? MEDAL_COLORS[3];
        const isSelf = currentUserId != null && entry.userId === currentUserId;
        const nameLabel = entry.displayName || entry.username || 'Collector';

        return (
          <View key={entry.userId} style={[styles.slot, isFirst && styles.slotFirst]}>
            <View
              style={[
                styles.avatarRing,
                { borderColor: medal.border },
                isFirst && styles.avatarRingFirst,
                isSelf && styles.avatarRingSelf
              ]}
            >
              <ProfileAvatar
                url={entry.avatarUrl}
                name={nameLabel}
                size={isFirst ? s(80) : s(60)}
                onPress={onPressUser ? () => onPressUser(entry) : undefined}
              />
            </View>

            <View style={[styles.medalBadge, { backgroundColor: medal.bg, borderColor: medal.border }]}>
              <Text style={[styles.medalText, { color: medal.text }]}>{rank}</Text>
            </View>

            <Text style={[styles.name, isFirst && styles.nameFirst]} numberOfLines={1}>
              {nameLabel}
            </Text>
            <Text style={styles.points}>{formatPoints(entry.points)}</Text>
            <Text style={styles.pointsLabel}>PTS</Text>

            {isSelf ? <Text style={styles.youTag}>YOU</Text> : null}

            <View style={[styles.pedestal, { height: isFirst ? s(40) : rank === 2 ? s(28) : s(20) }, { borderTopColor: medal.border }]}>
              <Text style={[styles.pedestalRank, { color: medal.border }]}>#{rank}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

function createStyles(s: (n: number) => number, t: (n: number) => number) {
  const tb = (n: number) => bodyText(t, n);

  return StyleSheet.create({
    podium: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'center',
      marginTop: s(8),
      marginBottom: s(16),
      gap: s(8),
      paddingHorizontal: s(4)
    },
    slot: {
      flex: 1,
      alignItems: 'center',
      gap: s(4)
    },
    slotFirst: {
      marginBottom: s(12)
    },
    avatarRing: {
      borderRadius: s(50),
      borderWidth: 2,
      padding: s(2)
    },
    avatarRingFirst: {
      borderWidth: 3,
      padding: s(3)
    },
    avatarRingSelf: {
      borderColor: figmaColors.navActive
    },
    medalBadge: {
      width: s(24),
      height: s(24),
      borderRadius: s(12),
      borderWidth: 1,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: -s(8),
      zIndex: 1
    },
    medalText: {
      fontFamily: appFonts.bodyBold,
      fontSize: t(12),
      lineHeight: t(14)
    },
    name: {
      fontFamily: appFonts.bodyBold,
      fontSize: tb(14),
      lineHeight: tb(17),
      color: figmaColors.charcoal,
      textAlign: 'center',
      paddingHorizontal: s(2)
    },
    nameFirst: {
      fontSize: tb(16),
      lineHeight: tb(19)
    },
    points: {
      fontFamily: appFonts.bodyBold,
      fontSize: tb(13),
      lineHeight: tb(16),
      color: figmaColors.textAccent,
      textAlign: 'center'
    },
    pointsLabel: {
      fontFamily: appFonts.accent,
      fontSize: tb(9),
      color: figmaColors.gray,
      letterSpacing: 0.8,
      textTransform: 'uppercase',
      marginTop: -s(2)
    },
    youTag: {
      fontFamily: appFonts.accent,
      fontSize: tb(9),
      color: figmaColors.navActive,
      letterSpacing: 1.2,
      textTransform: 'uppercase'
    },
    pedestal: {
      width: '100%',
      backgroundColor: figmaColors.tagBg,
      borderTopWidth: 2,
      borderRadius: s(4),
      marginTop: s(4),
      alignItems: 'center',
      justifyContent: 'center'
    },
    pedestalRank: {
      fontFamily: appFonts.accent,
      fontSize: tb(10),
      letterSpacing: 0.8,
      textTransform: 'uppercase',
      paddingVertical: s(2)
    }
  });
}
