import React from 'react';
import { appFonts } from '@/constants/appFonts';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { ProfileAvatar } from '@/components/profile/ProfileAvatar';
import { formatPoints } from '@/lib/leaderboard';
import { inferCollectorRole } from '@/lib/leaderboard-ui';
import { leaderboardAssets } from '@/constants/leaderboardAssets';
import { figmaColors } from '@/constants/figmaColors';
import { bodyText } from '@/constants/appTypography';

export type LeaderboardRankCardProps = {
  userId: string;
  rank: number;
  displayName: string;
  username: string | null;
  avatarUrl: string | null;
  points: number;
  isCurrentUser?: boolean;
  onPress?: () => void;
  s: (n: number) => number;
  t: (n: number) => number;
};

export function LeaderboardRankCard({
  userId,
  rank,
  displayName,
  username,
  avatarUrl,
  points,
  isCurrentUser,
  onPress,
  s,
  t
}: LeaderboardRankCardProps) {
  const styles = createStyles(s, t, isCurrentUser);
  const nameLabel = displayName || username || 'Collector';
  const roleLabel = inferCollectorRole(userId);

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : 'text'}
      accessibilityLabel={`Rank ${rank}: ${nameLabel}, ${formatPoints(points)} points`}
    >
      <View style={styles.rankCol}>
        {isCurrentUser ? (
          <Image source={leaderboardAssets.iconOther} style={styles.star} resizeMode="contain" />
        ) : (
          <View style={styles.starSpacer} />
        )}
        <Text style={[styles.rankNum, isCurrentUser && styles.rankNumSelf]}>{rank}</Text>
      </View>

      <View style={styles.avatarWrap}>
        <Image source={leaderboardAssets.avatarFrame} style={styles.avatarFrame} resizeMode="contain" />
        <View style={styles.avatarInner}>
          <ProfileAvatar url={avatarUrl} name={nameLabel} size={s(52)} />
        </View>
      </View>

      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={1}>
          {nameLabel}
          {isCurrentUser ? <Text style={styles.youInline}> (You)</Text> : null}
        </Text>
        <Text style={styles.role} numberOfLines={1}>
          {roleLabel}
        </Text>
      </View>

      <Text style={styles.points}>{formatPoints(points)}</Text>

      {onPress ? (
        <Image source={leaderboardAssets.sectionChevron} style={styles.chevron} resizeMode="contain" />
      ) : null}
    </Pressable>
  );
}

function createStyles(
  s: (n: number) => number,
  t: (n: number) => number,
  isCurrentUser?: boolean
) {
  const tb = (n: number) => bodyText(t, n);

  return StyleSheet.create({
    card: {
      backgroundColor: isCurrentUser ? '#F3E8C8' : figmaColors.cream,
      borderWidth: 1,
      borderColor: isCurrentUser ? figmaColors.borderStrong : figmaColors.borderLight,
      borderRadius: s(10),
      marginBottom: s(4),
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: s(14),
      paddingLeft: s(12),
      paddingRight: s(10),
      gap: s(10)
    },
    pressed: {
      opacity: 0.88
    },
    rankCol: {
      width: s(34),
      alignItems: 'center',
      flexShrink: 0
    },
    star: {
      width: s(14),
      height: s(14),
      marginBottom: s(1)
    },
    starSpacer: {
      height: s(15)
    },
    rankNum: {
      fontFamily: appFonts.bodyBold,
      fontSize: tb(19),
      color: figmaColors.gray,
      textAlign: 'center'
    },
    rankNumSelf: {
      color: figmaColors.charcoal
    },
    avatarWrap: {
      width: s(54),
      height: s(54),
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0
    },
    avatarFrame: {
      ...StyleSheet.absoluteFillObject,
      width: s(54),
      height: s(54)
    },
    avatarInner: {
      alignItems: 'center',
      justifyContent: 'center'
    },
    body: {
      flex: 1,
      minWidth: 0,
      justifyContent: 'center',
      gap: s(1)
    },
    name: {
      fontFamily: appFonts.bodyBold,
      fontSize: tb(19),
      lineHeight: tb(22),
      color: figmaColors.charcoal
    },
    youInline: {
      fontFamily: appFonts.body,
      fontSize: tb(16),
      color: figmaColors.gray
    },
    role: {
      fontFamily: appFonts.body,
      fontSize: tb(15),
      lineHeight: tb(18),
      color: figmaColors.gray
    },
    points: {
      fontFamily: appFonts.bodyBold,
      fontSize: tb(17),
      color: figmaColors.charcoal,
      flexShrink: 0,
      minWidth: s(64),
      textAlign: 'right'
    },
    chevron: {
      width: s(10),
      height: s(16),
      flexShrink: 0,
      opacity: 0.85
    }
  });
}
