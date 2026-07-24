/**
 * Confirmed Most Wanted badges the collector has earned — visible to owner and visitors.
 * Each badge shows how many times it was awarded (contribution count).
 */
import React, { useMemo } from 'react';
import { Image, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { appFonts } from '@/constants/appFonts';
import { figmaColors } from '@/constants/figmaColors';
import { leaderboardCopy } from '@/constants/leaderboardCopy';
import { contributorBadgeImage } from '@/constants/mostWantedContent';
import type { UserConfirmedContributorBadge } from '@/lib/most-wanted';

export function ProfileContributorBadges({
  badges,
  s,
  t
}: {
  badges: UserConfirmedContributorBadge[];
  s: (n: number) => number;
  t: (n: number) => number;
}) {
  const { width: windowWidth } = useWindowDimensions();
  const styles = useMemo(
    () => createStyles(s, t, windowWidth, badges.length),
    [s, t, windowWidth, badges.length]
  );

  const totalAwards = useMemo(
    () => badges.reduce((sum, b) => sum + (b.award_count || 0), 0),
    [badges]
  );

  if (badges.length === 0) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.title}>{leaderboardCopy.profile.mostWantedBadges}</Text>
      <Text style={styles.hint}>
        {leaderboardCopy.profile.mostWantedBadgesSummary(totalAwards, badges.length)}
      </Text>
      <View style={styles.grid}>
        {badges.map((badge) => {
          const source = contributorBadgeImage(badge.badge_key);
          if (!source) return null;
          const count = badge.award_count || 1;
          return (
            <View
              key={badge.badge_key}
              style={styles.item}
              accessibilityLabel={`${badge.badge_label}, earned ${count} time${count === 1 ? '' : 's'}`}
            >
              <View style={styles.imageWrap}>
                <Image source={source} style={styles.image} resizeMode="contain" />
                <View style={styles.countChip}>
                  <Text style={styles.countText}>×{count}</Text>
                </View>
              </View>
              <Text style={styles.label} numberOfLines={2}>
                {badge.badge_label}
              </Text>
              <Text style={styles.countLabel}>
                {leaderboardCopy.profile.mostWantedBadgeTimes(count)}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function createStyles(
  s: (n: number) => number,
  t: (n: number) => number,
  windowWidth: number,
  badgeCount: number
) {
  const contentWidth = Math.max(200, windowWidth - s(40) - s(20));
  const preferredCols = contentWidth >= 640 ? 5 : contentWidth >= 400 ? 3 : 2;
  const columns = Math.min(preferredCols, Math.max(1, badgeCount));
  const gap = s(10);
  const itemWidth = Math.floor((contentWidth - gap * (columns - 1)) / columns);
  const imageSize = Math.min(itemWidth - s(4), s(118));

  return StyleSheet.create({
    section: {
      width: '100%',
      marginTop: s(2),
      marginBottom: s(16),
      gap: s(8),
      paddingVertical: s(12),
      paddingHorizontal: s(10),
      borderRadius: s(14),
      backgroundColor: figmaColors.surfaceElevated,
      borderWidth: 1,
      borderColor: figmaColors.borderLight
    },
    title: {
      fontFamily: appFonts.accent,
      fontSize: t(13),
      letterSpacing: 0.8,
      color: figmaColors.charcoal
    },
    hint: {
      fontFamily: appFonts.body,
      fontSize: t(12),
      color: figmaColors.textMuted,
      marginBottom: s(2)
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap,
      width: '100%'
    },
    item: {
      width: itemWidth,
      alignItems: 'center',
      gap: s(4),
      paddingVertical: s(4)
    },
    imageWrap: {
      width: imageSize,
      height: imageSize * 1.18,
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative'
    },
    image: {
      width: imageSize,
      height: imageSize * 1.18
    },
    countChip: {
      position: 'absolute',
      top: s(2),
      right: s(2),
      backgroundColor: figmaColors.charcoal,
      borderRadius: s(8),
      paddingHorizontal: s(6),
      paddingVertical: s(2),
      zIndex: 1
    },
    countText: {
      fontFamily: appFonts.bodyBold,
      fontSize: t(10),
      color: figmaColors.cream
    },
    label: {
      fontFamily: appFonts.bodyBold,
      fontSize: t(12),
      lineHeight: t(14),
      color: figmaColors.charcoal,
      textAlign: 'center',
      minHeight: t(28)
    },
    countLabel: {
      fontFamily: appFonts.accent,
      fontSize: t(10),
      letterSpacing: 0.4,
      color: figmaColors.accentStrong,
      textAlign: 'center'
    }
  });
}
