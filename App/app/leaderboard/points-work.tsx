/**
 * How Points Work — full scoring guide driven by leaderboard_point_rules.
 */
import { useFocusEffect, useRouter } from 'expo-router';
import { appFonts } from '@/constants/appFonts';
import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { PointsActionLinks } from '@/components/points-work/PointsActionLinks';
import { PointsCategorySection } from '@/components/points-work/PointsCategorySection';
import { PointsRankingSteps } from '@/components/points-work/PointsRankingSteps';
import { PointsSummaryTiles } from '@/components/points-work/PointsSummaryTiles';
import { ProfileSubpageHeader } from '@/components/profile/ProfileSubpageHeader';
import { FigmaScreen } from '@/components/figma/FigmaScreen';
import { createFigmaPageStyles } from '@/components/figma/figmaPageStyles';
import { pointsWorkCopy } from '@/constants/pointsWorkCopy';
import { bodyText } from '@/constants/appTypography';
import { figmaColors } from '@/constants/figmaColors';
import { monthlyPrizeHref } from '@/constants/navigation';
import { useFigmaLayout } from '@/hooks/useFigmaLayout';
import { fetchActiveMonthlyPrize, listLeaderboardPointRules, type LeaderboardPointRule, type MonthlyPrize } from '@/lib/leaderboard';
import { buildPrizeCardDisplay } from '@/lib/prize-display';
import {
  fallbackPointRules,
  groupPointRulesForDisplay
} from '@/lib/points-work';

export default function PointsWorkScreen() {
  const router = useRouter();
  const { s, t } = useFigmaLayout(1);
  const page = useMemo(() => createFigmaPageStyles(s, t), [s, t]);
  const styles = useMemo(() => createLocalStyles(s, t), [s, t]);

  const [rules, setRules] = useState<LeaderboardPointRule[]>([]);
  const [monthlyPrize, setMonthlyPrize] = useState<MonthlyPrize | null>(null);
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);

    const [{ items, error: fetchError }, prizeResult] = await Promise.all([
      listLeaderboardPointRules(),
      fetchActiveMonthlyPrize()
    ]);

    setMonthlyPrize(prizeResult.prize);

    if (items.length > 0) {
      setRules(items);
      setUsingFallback(false);
    } else {
      setRules(fallbackPointRules());
      setUsingFallback(true);
      if (fetchError) setError(fetchError);
    }

    setLoading(false);
  }, []);

  useFocusEffect(useCallback(() => { void load(); }, [load]));

  const { categories, penalties } = useMemo(
    () => groupPointRulesForDisplay(rules),
    [rules]
  );

  const prizeDisplay = useMemo(() => buildPrizeCardDisplay(monthlyPrize), [monthlyPrize]);

  return (
    <FigmaScreen scrollProps={{ contentContainerStyle: page.scrollContent }}>
      <ProfileSubpageHeader
        title={pointsWorkCopy.title}
        subtitle={pointsWorkCopy.subtitle}
        description={pointsWorkCopy.description}
        s={s}
        t={t}
        onBack={() => router.back()}
      />

      {loading ? (
        <View style={styles.centred}>
          <ActivityIndicator size="large" color={figmaColors.charcoal} />
          <Text style={styles.loadingText}>{pointsWorkCopy.loading}</Text>
        </View>
      ) : (
        <>
          {usingFallback && error ? (
            <View style={styles.fallbackBanner}>
              <Text style={styles.fallbackText}>{pointsWorkCopy.fallbackNote}</Text>
              <Pressable onPress={() => void load()} accessibilityRole="button">
                <Text style={styles.retryLink}>{pointsWorkCopy.retry}</Text>
              </Pressable>
            </View>
          ) : null}

          <PointsSummaryTiles rules={rules} s={s} t={t} />

          {categories.map((block) => (
            <PointsCategorySection
              key={block.key}
              title={block.label}
              groupKey={block.key}
              rules={block.rules}
              s={s}
              t={t}
            />
          ))}

          {penalties.length > 0 ? (
            <PointsCategorySection
              title={pointsWorkCopy.penaltiesTitle}
              groupKey="other"
              rules={penalties}
              footerNote={pointsWorkCopy.adminAdjustmentNote}
              s={s}
              t={t}
            />
          ) : null}

          <PointsRankingSteps s={s} t={t} />
          <PointsActionLinks s={s} t={t} />

          <Pressable
            style={styles.prizePanel}
            onPress={() => router.push(monthlyPrizeHref())}
            accessibilityRole="button"
          >
            <Text style={styles.prizeTitle}>{prizeDisplay.sectionLabel}</Text>
            <Text style={styles.prizeBody}>{prizeDisplay.prizeName}</Text>
            {prizeDisplay.summary ? (
              <Text style={styles.prizeSummary}>{prizeDisplay.summary}</Text>
            ) : null}
          </Pressable>
        </>
      )}
    </FigmaScreen>
  );
}

function createLocalStyles(s: (n: number) => number, t: (n: number) => number) {
  const tb = (n: number) => bodyText(t, n);

  return StyleSheet.create({
    centred: {
      alignItems: 'center',
      paddingVertical: s(40),
      gap: s(12)
    },
    loadingText: {
      fontFamily: appFonts.body,
      fontSize: tb(17),
      color: figmaColors.gray
    },
    fallbackBanner: {
      backgroundColor: figmaColors.surfaceMuted,
      borderRadius: s(10),
      padding: s(12),
      marginBottom: s(14),
      gap: s(6)
    },
    fallbackText: {
      fontFamily: appFonts.body,
      fontSize: tb(14),
      lineHeight: tb(19),
      color: figmaColors.gray
    },
    retryLink: {
      fontFamily: appFonts.accent,
      fontSize: tb(13),
      color: figmaColors.navActive,
      letterSpacing: 0.4
    },
    prizePanel: {
      backgroundColor: figmaColors.tabActiveBg,
      borderRadius: s(14),
      padding: s(14),
      marginBottom: s(12)
    },
    prizeTitle: {
      fontFamily: appFonts.accent,
      fontSize: tb(12),
      color: '#C9A84C',
      letterSpacing: 0.8,
      textTransform: 'uppercase',
      marginBottom: s(6)
    },
    prizeBody: {
      fontFamily: appFonts.bodyBold,
      fontSize: tb(15),
      lineHeight: tb(21),
      color: figmaColors.charcoal
    },
    prizeSummary: {
      fontFamily: appFonts.body,
      fontSize: tb(14),
      lineHeight: tb(19),
      color: figmaColors.gray,
      marginTop: s(4)
    }
  });
}
