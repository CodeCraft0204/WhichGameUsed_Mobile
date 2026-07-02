/** Signed-in user's standing card — Figma "YOUR RANK" seal layout. */
import React from 'react';
import { appFonts } from '@/constants/appFonts';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { LeaderboardRankSeal } from '@/components/figma/LeaderboardRankSeal';
import { ProfileAvatar } from '@/components/profile/ProfileAvatar';
import { formatPoints } from '@/lib/leaderboard';
import type { LeaderboardEntry } from '@/lib/leaderboard';
import { inferCollectorRole } from '@/lib/leaderboard-ui';
import { leaderboardCopy } from '@/constants/leaderboardCopy';
import { leaderboardAssets } from '@/constants/leaderboardAssets';
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
  const roleLabel = inferCollectorRole(entry.userId);

  return (
    <View style={styles.card}>
      {/* <View style={styles.rankBlock}>
        <LeaderboardRankSeal
          rank={entry.rank}
          label={leaderboardCopy.selfRankLabel}
          s={s}
          t={t}
        />
      </View> */}

      <View style={styles.avatarWrap}>
        <Image source={leaderboardAssets.avatarFrame} style={styles.avatarFrame} resizeMode="contain" />
        <View style={styles.avatarInner}>
          <ProfileAvatar url={entry.avatarUrl} name={nameLabel} size={s(62)} />
        </View>
      </View>

      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={1}>
          {nameLabel}
          <Text style={styles.youSuffix}> (You)</Text>
        </Text>
        <Text style={styles.role} numberOfLines={1}>
          {roleLabel}
        </Text>
        <Text style={styles.points}>{formatPoints(entry.points)} pts</Text>
      </View>

      {onViewProfile ? (
        <Pressable style={styles.profileBtn} onPress={onViewProfile} accessibilityRole="button">
          <Image source={leaderboardAssets.viewProfileIcon} style={styles.profileIcon} resizeMode="contain" />
          <Text style={styles.profileBtnText}>{leaderboardCopy.viewProfile}</Text>
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
      backgroundColor: figmaColors.cream,
      borderWidth: 1.5,
      borderColor: figmaColors.borderStrong,
      borderRadius: s(18),
      marginBottom: s(16),
      paddingVertical: s(12),
      paddingHorizontal: s(10),
      gap: s(8)
    },
    cardMuted: {
      backgroundColor: figmaColors.surfaceMuted,
      borderColor: figmaColors.borderLight,
      flexDirection: 'column',
      alignItems: 'flex-start',
      gap: s(6)
    },
    rankBlock: {
      width: s(78),
      alignItems: 'center',
      flexShrink: 0
    },
    avatarWrap: {
      width: s(70),
      height: s(70),
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
      marginLeft: s(10),
    },
    avatarFrame: {
      ...StyleSheet.absoluteFillObject,
      width: s(70),
      height: s(70)
    },
    avatarInner: {
      alignItems: 'center',
      justifyContent: 'center'
    },
    body: {
      flex: 1,
      minWidth: 0,
      gap: s(1)
    },
    name: {
      fontFamily: appFonts.bodyBold,
      fontSize: tb(19),
      lineHeight: tb(22),
      color: figmaColors.charcoal
    },
    youSuffix: {
      fontFamily: appFonts.body,
      fontSize: tb(16),
      color: figmaColors.gray
    },
    role: {
      fontFamily: appFonts.body,
      fontSize: tb(15),
      color: figmaColors.gray
    },
    points: {
      fontFamily: appFonts.bodyBold,
      fontSize: tb(17),
      color: figmaColors.textAccent,
      marginTop: s(2)
    },
    profileBtn: {
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: figmaColors.borderStrong,
      borderRadius: s(12),
      backgroundColor: figmaColors.surfaceElevated,
      paddingHorizontal: s(8),
      paddingVertical: s(18),
      minWidth: s(64),
      flexShrink: 0,
      gap: s(4)
    },
    profileIcon: {
      width: s(18),
      height: s(18)
    },
    profileBtnText: {
      fontFamily: appFonts.accent,
      fontSize: tb(10),
      color: figmaColors.charcoal,
      textTransform: 'uppercase',
      letterSpacing: 0.4,
      textAlign: 'center'
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
