import React, { useMemo } from 'react';
import { appFonts } from '@/constants/appFonts';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { ProfileAvatar } from '@/components/profile/ProfileAvatar';
import { PODIUM_RANK_THEME } from '@/constants/leaderboardAssets';
import { bodyText } from '@/constants/appTypography';
import { figmaColors } from '@/constants/figmaColors';
import { formatPoints } from '@/lib/leaderboard';
import type { LeaderboardEntry } from '@/lib/leaderboard';

export type PodiumRank = 1 | 2 | 3;

type Props = {
  entry: LeaderboardEntry;
  rank: PodiumRank;
  isSelf: boolean;
  onPress?: () => void;
  s: (n: number) => number;
  t: (n: number) => number;
};

const TIER = {
  1: { flex: 1.2, avatar: 150, badge: 60, lift: 0 },
  2: { flex: 1, avatar: 120, badge: 55, lift: 6 },
  3: { flex: 1, avatar: 100, badge: 50, lift: 10 }
} as const;

const POINTS_COLOR: Record<PodiumRank, string> = {
  1: '#9A7B2E',
  2: figmaColors.gray,
  3: '#8B5A2B'
};

export function PodiumUserTile({ entry, rank, isSelf, onPress, s, t }: Props) {
  const tier = TIER[rank];
  const theme = PODIUM_RANK_THEME[rank];
  const styles = useMemo(() => createStyles(s, t, tier.avatar, tier.badge), [s, t, tier.avatar, tier.badge]);

  const nameLabel = entry.displayName || entry.username || 'Collector';

  return (
    <Pressable
      style={({ pressed }) => [
        styles.tile,
        { flex: tier.flex, marginTop: s(tier.lift) },
        pressed && onPress && styles.pressed
      ]}
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole="button"
      accessibilityLabel={`Rank ${rank}: ${nameLabel}${isSelf ? ' (you)' : ''}, ${formatPoints(entry.points)} points`}
    >
      <View style={styles.avatarBlock}>
        <ProfileAvatar url={entry.avatarUrl} name={nameLabel} size={s(tier.avatar)} />
        <Image
          source={theme.laurel}
          style={styles.badge}
          resizeMode="contain"
          accessibilityLabel={`Rank ${rank}`}
        />
      </View>

      <Text style={styles.name} numberOfLines={1} ellipsizeMode="tail">
        {nameLabel}
        {isSelf ? <Text style={styles.youInline}>(you)</Text> : null}
      </Text>

      <Text style={[styles.points, { color: POINTS_COLOR[rank] }]}>
        {formatPoints(entry.points)} pts
      </Text>
    </Pressable>
  );
}

function createStyles(
  s: (n: number) => number,
  t: (n: number) => number,
  avatarDesign: number,
  badgeDesign: number
) {
  const tb = (n: number) => bodyText(t, n);
  const avatar = s(avatarDesign);
  const badge = s(badgeDesign);

  return StyleSheet.create({
    tile: {
      alignItems: 'center',
      paddingHorizontal: s(4),
      paddingVertical: s(6),
      minWidth: 0
    },
    pressed: {
      opacity: 0.88
    },
    avatarBlock: {
      width: avatar,
      height: avatar + badge * 0.45,
      alignItems: 'center',
      marginBottom: s(6)
    },
    badge: {
      position: 'absolute',
      bottom: 0,
      width: badge,
      height: badge
    },
    name: {
      fontFamily: appFonts.bodyBold,
      fontSize: tb(15),
      lineHeight: tb(18),
      color: figmaColors.charcoal,
      textAlign: 'center',
      width: '100%'
    },
    youInline: {
      fontFamily: appFonts.body,
      fontSize: tb(14),
      color: figmaColors.navActive
    },
    points: {
      fontFamily: appFonts.bodyBold,
      fontSize: tb(13),
      lineHeight: tb(16),
      marginTop: s(2),
      textAlign: 'center'
    }
  });
}
