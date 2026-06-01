import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import type { LeaderboardRank } from '@/constants/leaderboardContent';
import { figmaColors } from '@/constants/figmaColors';

type LeaderboardRankCardProps = LeaderboardRank & {
  s: (n: number) => number;
  t: (n: number) => number;
};

export function LeaderboardRankCard({
  rank,
  name,
  role,
  points,
  avatar,
  highlight,
  s,
  t
}: LeaderboardRankCardProps) {
  const styles = createStyles(s, t, highlight);

  return (
    <View style={styles.card}>
      <View style={styles.rankBadge}>
        <Text style={styles.rankText}>#{rank}</Text>
      </View>

      <View style={styles.avatarWrap}>
        <Image source={avatar} style={styles.avatar} resizeMode="cover" />
      </View>

      <View style={styles.body}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.role}>{role}</Text>
      </View>

      <View style={styles.pointsPill}>
        <Text style={styles.pointsValue}>{points}</Text>
        <Text style={styles.pointsLabel}>PTS</Text>
      </View>
    </View>
  );
}

function createStyles(
  s: (n: number) => number,
  t: (n: number) => number,
  highlight?: boolean
) {
  return StyleSheet.create({
    card: {
      backgroundColor: highlight ? '#f3f0ea' : figmaColors.cream,
      borderWidth: 1,
      borderColor: highlight ? figmaColors.accent : figmaColors.borderLight,
      borderRadius: s(highlight ? 12 : 10),
      minHeight: s(112),
      marginBottom: s(8),
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: s(10),
      paddingLeft: s(8),
      paddingRight: s(8)
    },
    rankBadge: {
      width: s(40),
      height: s(40),
      borderRadius: s(20),
      backgroundColor: '#eee8df',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0
    },
    rankText: {
      fontFamily: 'Inter_700Bold',
      fontSize: t(16),
      color: figmaColors.charcoal
    },
    avatarWrap: {
      width: s(72),
      height: s(72),
      borderRadius: s(36),
      overflow: 'hidden',
      marginHorizontal: s(8),
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      flexShrink: 0
    },
    avatar: {
      width: '100%',
      height: '100%'
    },
    body: {
      flex: 1,
      minWidth: 0,
      justifyContent: 'center',
      gap: s(4),
      paddingRight: s(6)
    },
    name: {
      fontFamily: 'Inter_700Bold',
      fontSize: t(18),
      lineHeight: t(22),
      color: figmaColors.charcoal
    },
    role: {
      fontFamily: 'Inter_700Bold',
      fontSize: t(13),
      lineHeight: t(16),
      color: figmaColors.gray
    },
    pointsPill: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: s(4),
      backgroundColor: '#eee8df',
      borderRadius: s(20),
      paddingHorizontal: s(12),
      paddingVertical: s(8),
      flexShrink: 0
    },
    pointsValue: {
      fontFamily: 'Inter_700Bold',
      fontSize: t(18),
      lineHeight: t(22),
      color: figmaColors.charcoal
    },
    pointsLabel: {
      fontFamily: 'Inter_700Bold',
      fontSize: t(12),
      lineHeight: t(14),
      color: figmaColors.gray
    }
  });
}
