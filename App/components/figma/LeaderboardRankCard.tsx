import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { appFonts } from '@/constants/appFonts';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ProfileAvatar } from '@/components/profile/ProfileAvatar';
import { formatPoints } from '@/lib/leaderboard';
import { figmaColors } from '@/constants/figmaColors';
import { bodyText } from '@/constants/appTypography';

export type LeaderboardRankCardProps = {
  rank: number;
  displayName: string;
  username: string | null;
  avatarUrl: string | null;
  points: number;
  highlight?: boolean;
  isCurrentUser?: boolean;
  onPress?: () => void;
  s: (n: number) => number;
  t: (n: number) => number;
};

export function LeaderboardRankCard({
  rank,
  displayName,
  username,
  avatarUrl,
  points,
  highlight,
  isCurrentUser,
  onPress,
  s,
  t
}: LeaderboardRankCardProps) {
  const styles = createStyles(s, t, highlight, isCurrentUser);
  const nameLabel = displayName || username || 'Collector';
  const subLabel = username ? `@${username}` : null;

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : 'text'}
      accessibilityLabel={`Rank ${rank}: ${nameLabel}, ${formatPoints(points)} points`}
    >
      <Text style={styles.rankNum}>{rank}</Text>

      <View style={styles.avatarWrap}>
        <ProfileAvatar url={avatarUrl} name={nameLabel} size={s(52)} />
      </View>

      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={1}>{nameLabel}</Text>
        {subLabel ? <Text style={styles.sub} numberOfLines={1}>{subLabel}</Text> : null}
        {isCurrentUser ? <Text style={styles.youLabel}>YOU</Text> : null}
      </View>

      <View style={styles.pointsCol}>
        <Text style={styles.pointsValue}>{formatPoints(points)}</Text>
        <Text style={styles.pointsLabel}>PTS</Text>
      </View>

      {onPress ? (
        <Ionicons name="chevron-forward" size={s(18)} color={figmaColors.grayMuted} />
      ) : null}
    </Pressable>
  );
}

function createStyles(
  s: (n: number) => number,
  t: (n: number) => number,
  highlight?: boolean,
  isCurrentUser?: boolean
) {
  const tb = (n: number) => bodyText(t, n);

  return StyleSheet.create({
    card: {
      backgroundColor: isCurrentUser
        ? figmaColors.surfaceHighlight
        : figmaColors.cream,
      borderWidth: 1,
      borderColor: isCurrentUser ? figmaColors.borderStrong : figmaColors.borderLight,
      borderRadius: s(12),
      marginBottom: s(8),
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: s(12),
      paddingLeft: s(14),
      paddingRight: s(10),
      gap: s(8)
    },
    pressed: {
      opacity: 0.85
    },
    rankNum: {
      width: s(24),
      fontFamily: appFonts.bodyBold,
      fontSize: tb(17),
      color: figmaColors.gray,
      textAlign: 'center',
      flexShrink: 0
    },
    avatarWrap: {
      flexShrink: 0
    },
    body: {
      flex: 1,
      minWidth: 0,
      justifyContent: 'center',
      gap: s(1)
    },
    name: {
      fontFamily: appFonts.bodyBold,
      fontSize: tb(17),
      lineHeight: tb(21),
      color: figmaColors.charcoal
    },
    sub: {
      fontFamily: appFonts.body,
      fontSize: tb(12),
      lineHeight: tb(15),
      color: figmaColors.gray
    },
    youLabel: {
      fontFamily: appFonts.accent,
      fontSize: tb(9),
      color: figmaColors.navActive,
      letterSpacing: 1.2,
      textTransform: 'uppercase',
      marginTop: s(2)
    },
    pointsCol: {
      alignItems: 'flex-end',
      flexShrink: 0,
      marginRight: s(2)
    },
    pointsValue: {
      fontFamily: appFonts.bodyBold,
      fontSize: tb(15),
      lineHeight: tb(18),
      color: highlight ? figmaColors.textAccent : figmaColors.charcoal
    },
    pointsLabel: {
      fontFamily: appFonts.accent,
      fontSize: tb(9),
      color: figmaColors.gray,
      letterSpacing: 0.6,
      textTransform: 'uppercase'
    }
  });
}
