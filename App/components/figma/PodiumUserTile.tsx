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
  1: { flex: 1.12, avatar: 72, badge: 34, lift: 0 },
  2: { flex: 1, avatar: 58, badge: 28, lift: 8 },
  3: { flex: 1, avatar: 54, badge: 26, lift: 12 }
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
        isSelf && styles.tileSelf,
        pressed && onPress && styles.pressed
      ]}
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole="button"
      accessibilityLabel={`Rank ${rank}: ${nameLabel}, ${formatPoints(entry.points)} points`}
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
      </Text>

      <Text style={[styles.points, { color: POINTS_COLOR[rank] }]}>
        {formatPoints(entry.points)} pts
      </Text>

      {isSelf ? <Text style={styles.you}>YOU</Text> : null}
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
    tileSelf: {
      backgroundColor: 'rgba(139, 111, 82, 0.08)',
      borderRadius: s(10)
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
    points: {
      fontFamily: appFonts.bodyBold,
      fontSize: tb(13),
      lineHeight: tb(16),
      marginTop: s(2),
      textAlign: 'center'
    },
    you: {
      fontFamily: appFonts.accent,
      fontSize: tb(10),
      color: figmaColors.navActive,
      letterSpacing: 0.6,
      textTransform: 'uppercase',
      marginTop: s(4),
      textAlign: 'center'
    }
  });
}
