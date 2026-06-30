/**
 * Signed-in user's standing card.
 * Handles three states: ranked, unranked, ineligible.
 */
import React from 'react';
import { appFonts } from '@/constants/appFonts';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ProfileAvatar } from '@/components/profile/ProfileAvatar';
import { formatPoints } from '@/lib/leaderboard';
import type { LeaderboardEntry } from '@/lib/leaderboard';
import { leaderboardCopy } from '@/constants/leaderboardCopy';
import { figmaColors } from '@/constants/figmaColors';
import { bodyText } from '@/constants/appTypography';

type SelfCardProps = {
  entry: LeaderboardEntry | null;
  isEligible: boolean;
  onGoToSettings?: () => void;
  s: (n: number) => number;
  t: (n: number) => number;
};

export function LeaderboardSelfCard({ entry, isEligible, onGoToSettings, s, t }: SelfCardProps) {
  const styles = createStyles(s, t);

  if (!isEligible) {
    return (
      <View style={[styles.card, styles.cardMuted]}>
        <Text style={styles.mutedText}>{leaderboardCopy.selfIneligible}</Text>
        {onGoToSettings ? (
          <Pressable onPress={onGoToSettings} accessibilityRole="button">
            <Text style={styles.settingsLink}>Open Settings</Text>
          </Pressable>
        ) : null}
      </View>
    );
  }

  if (!entry) {
    return (
      <View style={[styles.card, styles.cardMuted]}>
        <Text style={styles.mutedText}>{leaderboardCopy.selfUnranked}</Text>
      </View>
    );
  }

  const nameLabel = entry.displayName || entry.username || 'Collector';

  return (
    <View style={styles.card}>
      <View style={styles.rankWrap}>
        <Text style={styles.rankLabel}>{leaderboardCopy.selfRankLabel}</Text>
        <Text style={styles.rankNumber}>#{entry.rank}</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.avatarWrap}>
        <ProfileAvatar url={entry.avatarUrl} name={nameLabel} size={s(48)} />
      </View>

      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={1}>{nameLabel}</Text>
        {entry.username ? <Text style={styles.sub}>@{entry.username}</Text> : null}
      </View>

      <View style={styles.pointsPill}>
        <Text style={styles.pointsValue}>{formatPoints(entry.points)}</Text>
        <Text style={styles.pointsUnit}>PTS</Text>
      </View>
    </View>
  );
}

function createStyles(s: (n: number) => number, t: (n: number) => number) {
  const tb = (n: number) => bodyText(t, n);

  return StyleSheet.create({
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: figmaColors.surfaceElevated,
      borderWidth: 1.5,
      borderColor: figmaColors.borderStrong,
      borderRadius: s(12),
      marginBottom: s(12),
      paddingVertical: s(12),
      paddingHorizontal: s(12),
      gap: s(10)
    },
    cardMuted: {
      backgroundColor: figmaColors.surfaceMuted,
      borderColor: figmaColors.borderLight,
      flexDirection: 'column',
      alignItems: 'flex-start',
      gap: s(6)
    },
    rankWrap: {
      alignItems: 'center',
      gap: s(1),
      minWidth: s(44)
    },
    rankLabel: {
      fontFamily: appFonts.accent,
      fontSize: tb(9),
      color: figmaColors.gray,
      textTransform: 'uppercase',
      letterSpacing: 0.8
    },
    rankNumber: {
      fontFamily: appFonts.display,
      fontSize: t(24),
      color: figmaColors.charcoal,
      lineHeight: t(28)
    },
    divider: {
      width: 1,
      height: s(40),
      backgroundColor: figmaColors.divider
    },
    avatarWrap: {
      flexShrink: 0
    },
    body: {
      flex: 1,
      minWidth: 0,
      gap: s(2)
    },
    name: {
      fontFamily: appFonts.bodyBold,
      fontSize: tb(17),
      lineHeight: tb(20),
      color: figmaColors.charcoal
    },
    sub: {
      fontFamily: appFonts.body,
      fontSize: tb(13),
      lineHeight: tb(16),
      color: figmaColors.gray
    },
    pointsPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(3),
      backgroundColor: figmaColors.tagBg,
      borderRadius: s(16),
      paddingHorizontal: s(10),
      paddingVertical: s(6)
    },
    pointsValue: {
      fontFamily: appFonts.bodyBold,
      fontSize: tb(16),
      lineHeight: tb(20),
      color: figmaColors.charcoal
    },
    pointsUnit: {
      fontFamily: appFonts.accent,
      fontSize: tb(9),
      color: figmaColors.gray,
      textTransform: 'uppercase',
      letterSpacing: 0.8
    },
    mutedText: {
      fontFamily: appFonts.body,
      fontSize: tb(17),
      lineHeight: tb(22),
      color: figmaColors.gray
    },
    settingsLink: {
      fontFamily: appFonts.accent,
      fontSize: tb(14),
      color: figmaColors.navActive,
      textTransform: 'uppercase',
      letterSpacing: 0.8
    }
  });
}
