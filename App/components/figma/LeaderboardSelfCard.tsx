/**
 * Signed-in user's standing card with profile link.
 */
import React from 'react';
import { Ionicons } from '@expo/vector-icons';
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
  onViewProfile?: () => void;
  s: (n: number) => number;
  t: (n: number) => number;
};

export function LeaderboardSelfCard({
  entry,
  isEligible,
  onGoToSettings,
  onViewProfile,
  s,
  t
}: SelfCardProps) {
  const styles = createStyles(s, t);

  if (!isEligible) {
    return (
      <View style={[styles.card, styles.cardMuted]}>
        <Text style={styles.mutedText}>{leaderboardCopy.selfIneligible}</Text>
        {onGoToSettings ? (
          <Pressable onPress={onGoToSettings} accessibilityRole="button">
            <Text style={styles.link}>Open Settings</Text>
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
      <View style={styles.rankBlock}>
        <Text style={styles.rankLabel}>{leaderboardCopy.selfRankLabel}</Text>
        <Text style={styles.rankNumber}>{entry.rank}</Text>
      </View>

      <View style={styles.avatarWrap}>
        <ProfileAvatar url={entry.avatarUrl} name={nameLabel} size={s(52)} />
      </View>

      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={1}>{nameLabel}</Text>
        <Text style={styles.points}>{formatPoints(entry.points)} PTS</Text>
      </View>

      {onViewProfile ? (
        <Pressable style={styles.profileBtn} onPress={onViewProfile} accessibilityRole="button">
          <Text style={styles.profileBtnText}>{leaderboardCopy.viewProfile}</Text>
          <Ionicons name="chevron-forward" size={s(14)} color={figmaColors.navActive} />
        </Pressable>
      ) : null}
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
      borderRadius: s(14),
      marginBottom: s(14),
      paddingVertical: s(14),
      paddingHorizontal: s(14),
      gap: s(12)
    },
    cardMuted: {
      backgroundColor: figmaColors.surfaceMuted,
      borderColor: figmaColors.borderLight,
      flexDirection: 'column',
      alignItems: 'flex-start',
      gap: s(6)
    },
    rankBlock: {
      alignItems: 'center',
      minWidth: s(52)
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
      fontSize: t(28),
      color: figmaColors.charcoal,
      lineHeight: t(32)
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
    points: {
      fontFamily: appFonts.accent,
      fontSize: tb(12),
      color: figmaColors.textAccent,
      letterSpacing: 0.6,
      textTransform: 'uppercase'
    },
    profileBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(2),
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      borderRadius: s(20),
      paddingHorizontal: s(10),
      paddingVertical: s(8),
      flexShrink: 0
    },
    profileBtnText: {
      fontFamily: appFonts.accent,
      fontSize: tb(10),
      color: figmaColors.navActive,
      textTransform: 'uppercase',
      letterSpacing: 0.6
    },
    mutedText: {
      fontFamily: appFonts.body,
      fontSize: tb(17),
      lineHeight: tb(22),
      color: figmaColors.gray
    },
    link: {
      fontFamily: appFonts.accent,
      fontSize: tb(14),
      color: figmaColors.navActive,
      textTransform: 'uppercase',
      letterSpacing: 0.8
    }
  });
}
