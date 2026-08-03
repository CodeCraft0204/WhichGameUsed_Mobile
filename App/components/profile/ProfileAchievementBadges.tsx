/**
 * Achievement badges on profile — full catalog with earned + locked states.
 */
import React, { useMemo } from 'react';
import { Image, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { appFonts } from '@/constants/appFonts';
import { figmaColors } from '@/constants/figmaColors';
import { reputationCopy } from '@/constants/reputationCopy';
import {
  achievementBadgeCatalog,
  achievementBadgeImage,
  achievementBadgeLabel
} from '@/constants/reputationContent';

export type ProfileAchievementAward = {
  badgeKey: string;
  label: string;
  awardedAt: string;
};

export function ProfileAchievementBadges({
  awards,
  s,
  t
}: {
  awards: ProfileAchievementAward[];
  s: (n: number) => number;
  t: (n: number) => number;
}) {
  const { width: windowWidth } = useWindowDimensions();
  const earnedByKey = useMemo(() => {
    const map = new Map<string, ProfileAchievementAward>();
    for (const a of awards) {
      if (a.badgeKey) map.set(a.badgeKey, a);
    }
    return map;
  }, [awards]);

  const badges = useMemo(
    () =>
      achievementBadgeCatalog.map((row) => {
        const earned = earnedByKey.get(row.key);
        return {
          badgeKey: row.key,
          label: earned?.label?.trim() || achievementBadgeLabel(row.key),
          awardedAt: earned?.awardedAt ?? null,
          earned: Boolean(earned)
        };
      }),
    [earnedByKey]
  );

  const earnedCount = badges.filter((b) => b.earned).length;
  const styles = useMemo(
    () => createStyles(s, t, windowWidth, badges.length),
    [s, t, windowWidth, badges.length]
  );

  const summary =
    earnedCount === 0
      ? 'No achievement badges earned yet — keep contributing.'
      : earnedCount === 1
        ? '1 achievement badge earned.'
        : `${earnedCount} achievement badges earned.`;

  return (
    <View style={styles.section}>
      <Text style={styles.title}>{reputationCopy.achievementsTitle}</Text>
      <Text style={styles.hint}>{summary}</Text>
      <Text style={styles.subhint}>{reputationCopy.achievementsHint}</Text>
      <View style={styles.grid}>
        {badges.map((badge) => {
          const source = achievementBadgeImage(badge.badgeKey);
          return (
            <View
              key={badge.badgeKey}
              style={[styles.item, !badge.earned ? styles.itemLocked : null]}
              accessibilityLabel={
                badge.earned
                  ? `${badge.label} achievement`
                  : `${badge.label} locked`
              }
            >
              <View style={styles.imageWrap}>
                <Image
                  source={source}
                  style={[styles.image, !badge.earned ? styles.imageLocked : null]}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.label} numberOfLines={2}>
                {badge.label}
              </Text>
              {badge.earned && badge.awardedAt ? (
                <Text style={styles.countLabel}>{formatAwarded(badge.awardedAt)}</Text>
              ) : badge.earned ? (
                <Text style={styles.countLabel}>Earned</Text>
              ) : (
                <Text style={styles.lockedLabel}>{reputationCopy.achievementLocked}</Text>
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
}

function formatAwarded(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return 'Earned';
  return d.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
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
      marginBottom: s(0)
    },
    subhint: {
      fontFamily: appFonts.body,
      fontSize: t(11),
      color: figmaColors.gray,
      marginBottom: s(2),
      lineHeight: t(15)
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
    itemLocked: {
      opacity: 0.55
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
    imageLocked: {
      opacity: 0.45
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
    },
    lockedLabel: {
      fontFamily: appFonts.accent,
      fontSize: t(10),
      letterSpacing: 0.4,
      color: figmaColors.gray,
      textAlign: 'center'
    }
  });
}
