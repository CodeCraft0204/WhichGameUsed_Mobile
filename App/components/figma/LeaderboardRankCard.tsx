import React from 'react';
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
      <View style={styles.rankBadge}>
        <Text style={styles.rankText}>#{rank}</Text>
      </View>

      <View style={styles.avatarWrap}>
        <ProfileAvatar url={avatarUrl} name={nameLabel} size={s(68)} />
      </View>

      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={1}>{nameLabel}</Text>
        {subLabel ? <Text style={styles.sub} numberOfLines={1}>{subLabel}</Text> : null}
        {isCurrentUser ? <Text style={styles.youLabel}>YOU</Text> : null}
      </View>

      <View style={styles.pointsPill}>
        <Text style={styles.pointsValue}>{formatPoints(points)}</Text>
        <Text style={styles.pointsLabel}>PTS</Text>
      </View>
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
  const selfRing = isCurrentUser && !highlight;

  return StyleSheet.create({
    card: {
      backgroundColor: highlight
        ? figmaColors.surfaceHighlight
        : isCurrentUser
          ? figmaColors.creamLight
          : figmaColors.cream,
      borderWidth: highlight ? 1.5 : 1,
      borderColor: highlight
        ? figmaColors.accent
        : isCurrentUser
          ? figmaColors.borderStrong
          : figmaColors.borderLight,
      borderRadius: s(highlight ? 14 : 10),
      marginBottom: s(8),
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: s(10),
      paddingLeft: s(10),
      paddingRight: s(10),
      ...(selfRing ? { shadowColor: figmaColors.accent, shadowOpacity: 0.18, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 2 } : {})
    },
    pressed: {
      opacity: 0.82
    },
    rankBadge: {
      width: s(40),
      height: s(40),
      borderRadius: s(20),
      backgroundColor: highlight ? figmaColors.accent : figmaColors.tagBg,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0
    },
    rankText: {
      fontFamily: appFonts.bodyBold,
      fontSize: t(15),
      color: highlight ? figmaColors.cream : figmaColors.charcoal
    },
    avatarWrap: {
      marginHorizontal: s(10),
      flexShrink: 0
    },
    body: {
      flex: 1,
      minWidth: 0,
      justifyContent: 'center',
      gap: s(2),
      paddingRight: s(6)
    },
    name: {
      fontFamily: appFonts.bodyBold,
      fontSize: tb(18),
      lineHeight: tb(22),
      color: figmaColors.charcoal
    },
    sub: {
      fontFamily: appFonts.body,
      fontSize: tb(13),
      lineHeight: tb(16),
      color: figmaColors.gray
    },
    youLabel: {
      fontFamily: appFonts.accent,
      fontSize: tb(10),
      color: figmaColors.navActive,
      letterSpacing: 1.2,
      textTransform: 'uppercase',
      marginTop: s(2)
    },
    pointsPill: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: s(3),
      backgroundColor: highlight ? figmaColors.accent : figmaColors.tagBg,
      borderRadius: s(20),
      paddingHorizontal: s(12),
      paddingVertical: s(8),
      flexShrink: 0
    },
    pointsValue: {
      fontFamily: appFonts.bodyBold,
      fontSize: tb(17),
      lineHeight: tb(20),
      color: highlight ? figmaColors.cream : figmaColors.charcoal
    },
    pointsLabel: {
      fontFamily: appFonts.accent,
      fontSize: tb(10),
      lineHeight: tb(13),
      color: highlight ? figmaColors.cream : figmaColors.gray,
      letterSpacing: 0.8,
      textTransform: 'uppercase'
    }
  });
}
