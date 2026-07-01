/**
 * Top-3 podium: #2 left | #1 center (raised) | #3 right.
 * Tappable slots with chest pedestals and medal badges.
 */
import React from 'react';
import { appFonts } from '@/constants/appFonts';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { ProfileAvatar } from '@/components/profile/ProfileAvatar';
import { figmaIcons } from '@/constants/figmaIcons';
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

const SLOT_THEME = {
  1: {
    ring: '#C9A84C',
    ringGlow: 'rgba(201, 168, 76, 0.35)',
    badgeBg: '#C9A84C',
    badgeIcon: figmaIcons.expertMedal,
    chestH: 72,
    avatar: 88
  },
  2: {
    ring: '#A8A8B0',
    ringGlow: 'rgba(168, 168, 176, 0.25)',
    badgeBg: '#A8A8B0',
    badgeIcon: figmaIcons.medalStar,
    chestH: 52,
    avatar: 68
  },
  3: {
    ring: '#A0724E',
    ringGlow: 'rgba(160, 114, 78, 0.25)',
    badgeBg: '#A0724E',
    badgeIcon: figmaIcons.medalStar,
    chestH: 40,
    avatar: 64
  }
} as const;

export function LeaderboardPodium({ top3, currentUserId, onPressUser, s, t }: PodiumProps) {
  const styles = createStyles(s, t);
  const podiumOrder = [top3[1], top3[0], top3[2]].filter(Boolean) as LeaderboardEntry[];

  if (podiumOrder.length === 0) return null;

  return (
    <View style={styles.podium}>
      {podiumOrder.map((entry) => {
        const rank = entry.rank as 1 | 2 | 3;
        const theme = SLOT_THEME[rank] ?? SLOT_THEME[3];
        const isFirst = rank === 1;
        const isSelf = currentUserId != null && entry.userId === currentUserId;
        const nameLabel = entry.displayName || entry.username || 'Collector';

        return (
          <Pressable
            key={entry.userId}
            style={[styles.slot, isFirst && styles.slotFirst]}
            onPress={onPressUser ? () => onPressUser(entry) : undefined}
            disabled={!onPressUser}
            accessibilityRole="button"
            accessibilityLabel={`Rank ${rank}: ${nameLabel}, ${formatPoints(entry.points)} points`}
          >
            {isFirst ? (
              <Image source={figmaIcons.trophyRanking} style={styles.laurel} resizeMode="contain" />
            ) : null}

            <View
              style={[
                styles.avatarRing,
                {
                  borderColor: theme.ring,
                  shadowColor: theme.ring,
                  padding: isFirst ? s(4) : s(3)
                },
                isSelf && styles.avatarRingSelf
              ]}
            >
              <ProfileAvatar
                url={entry.avatarUrl}
                name={nameLabel}
                size={s(theme.avatar)}
              />
            </View>

            <View style={[styles.medalBadge, { backgroundColor: theme.badgeBg }]}>
              <Image source={theme.badgeIcon} style={styles.medalIcon} resizeMode="contain" />
              <Text style={styles.medalRank}>{rank}</Text>
            </View>

            <Text style={[styles.name, isFirst && styles.nameFirst]} numberOfLines={1}>
              {nameLabel}
            </Text>
            <Text style={styles.points}>{formatPoints(entry.points)} PTS</Text>
            {isSelf ? <Text style={styles.youTag}>YOU</Text> : null}

            <View style={styles.chestWrap}>
              <Image
                source={figmaIcons.treasureChest}
                style={{ width: s(isFirst ? 88 : 72), height: s(theme.chestH) }}
                resizeMode="contain"
              />
            </View>
          </Pressable>
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
      marginTop: s(4),
      marginBottom: s(20),
      gap: s(6),
      paddingHorizontal: s(2)
    },
    slot: {
      flex: 1,
      alignItems: 'center',
      gap: s(3),
      paddingTop: s(8)
    },
    slotFirst: {
      marginBottom: s(8)
    },
    laurel: {
      width: s(36),
      height: s(36),
      marginBottom: -s(4),
      opacity: 0.9
    },
    avatarRing: {
      borderRadius: s(60),
      borderWidth: 3,
      shadowOpacity: 0.45,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 2 },
      elevation: 4
    },
    avatarRingSelf: {
      borderColor: figmaColors.navActive
    },
    medalBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(3),
      borderRadius: s(14),
      paddingHorizontal: s(8),
      paddingVertical: s(3),
      marginTop: -s(10),
      zIndex: 2,
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.35)'
    },
    medalIcon: {
      width: s(14),
      height: s(14)
    },
    medalRank: {
      fontFamily: appFonts.bodyBold,
      fontSize: t(12),
      color: figmaColors.cream
    },
    name: {
      fontFamily: appFonts.bodyBold,
      fontSize: tb(14),
      lineHeight: tb(17),
      color: figmaColors.charcoal,
      textAlign: 'center',
      paddingHorizontal: s(2),
      marginTop: s(2)
    },
    nameFirst: {
      fontSize: tb(16),
      lineHeight: tb(19)
    },
    points: {
      fontFamily: appFonts.accent,
      fontSize: tb(11),
      color: figmaColors.textAccent,
      letterSpacing: 0.6,
      textTransform: 'uppercase'
    },
    youTag: {
      fontFamily: appFonts.accent,
      fontSize: tb(9),
      color: figmaColors.navActive,
      letterSpacing: 1.2,
      textTransform: 'uppercase'
    },
    chestWrap: {
      marginTop: s(4),
      alignItems: 'center',
      justifyContent: 'flex-end'
    }
  });
}
