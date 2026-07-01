import { useFocusEffect, useRouter } from 'expo-router';
import { appFonts } from '@/constants/appFonts';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { createFigmaPageStyles } from '@/components/figma/figmaPageStyles';
import { FigmaHubBottomNav } from '@/components/figma/FigmaHubBottomNav';
import { FigmaPageHeader } from '@/components/figma/FigmaPageHeader';
import { FigmaScreen } from '@/components/figma/FigmaScreen';
import { LeaderboardPeriodTabs } from '@/components/figma/LeaderboardPeriodTabs';
import { LeaderboardPodium } from '@/components/figma/LeaderboardPodium';
import { LeaderboardPointsExplainer } from '@/components/figma/LeaderboardPointsExplainer';
import { LeaderboardRankCard } from '@/components/figma/LeaderboardRankCard';
import { LeaderboardResetBanner } from '@/components/figma/LeaderboardResetBanner';
import { LeaderboardSelfCard } from '@/components/figma/LeaderboardSelfCard';
import {
  ContextHeaderScrollProvider,
  useContextHeaderScrollProps
} from '@/context/ContextHeaderScrollContext';
import { leaderboardIcons, leaderboardPeriodTabs } from '@/constants/leaderboardContent';
import { leaderboardCopy } from '@/constants/leaderboardCopy';
import { publicProfileHref } from '@/constants/navigation';
import { figmaColors } from '@/constants/figmaColors';
import { bodyText } from '@/constants/appTypography';
import { useAuth } from '@/context/AuthContext';
import { useFigmaLayout } from '@/hooks/useFigmaLayout';
import { useLeaderboardRealtime } from '@/hooks/useLeaderboardRealtime';
import {
  listLeaderboard,
  getMyStanding,
  type LeaderboardEntry,
  type LeaderboardPeriod
} from '@/lib/leaderboard';

function tabToPeriod(tab: string): LeaderboardPeriod {
  return tab === 'ALL-TIME' ? 'all_time' : 'month';
}

export default function LeaderboardScreen() {
  return (
    <ContextHeaderScrollProvider>
      <LeaderboardScreenBody />
    </ContextHeaderScrollProvider>
  );
}

function LeaderboardScreenBody() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const { s, t } = useFigmaLayout();
  const page = useMemo(() => createFigmaPageStyles(s, t), [s, t]);
  const styles = useMemo(() => createLocalStyles(s, t), [s, t]);
  const scrollProps = useContextHeaderScrollProps({ contentContainerStyle: page.scrollContent });

  const [activeTab, setActiveTab] = useState<(typeof leaderboardPeriodTabs)[number]>(
    leaderboardPeriodTabs[0]
  );
  const [items, setItems] = useState<LeaderboardEntry[]>([]);
  const [selfEntry, setSelfEntry] = useState<LeaderboardEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const initialLoadDone = useRef(false);

  const isEligible = profile?.leaderboard_eligible !== false;
  const period = tabToPeriod(activeTab);

  const load = useCallback(async (tab: string, opts?: { silent?: boolean }) => {
    const silent = opts?.silent && initialLoadDone.current;
    if (!silent) setLoading(true);
    else setRefreshing(true);

    setError(null);
    const p = tabToPeriod(tab);
    const [rankResult, selfResult] = await Promise.all([
      listLeaderboard(p, 20),
      user ? getMyStanding(user.id, p) : Promise.resolve({ entry: null, rank: null, error: null })
    ]);

    if (rankResult.error) {
      setError(rankResult.error);
      setItems([]);
    } else {
      setItems(rankResult.items);
    }
    setSelfEntry(selfResult.entry);
    setLoading(false);
    setRefreshing(false);
    initialLoadDone.current = true;
  }, [user]);

  useFocusEffect(
    useCallback(() => { void load(activeTab); }, [load, activeTab])
  );

  const silentRefresh = useCallback(() => {
    void load(activeTab, { silent: true });
  }, [load, activeTab]);

  useLeaderboardRealtime(silentRefresh, initialLoadDone.current);

  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab as (typeof leaderboardPeriodTabs)[number]);
    void load(tab);
  }, [load]);

  const handlePressUser = useCallback((entry: LeaderboardEntry) => {
    router.push(publicProfileHref(entry.userId, {
      rank: entry.rank,
      points: entry.points,
      period
    }));
  }, [router, period]);

  const handleGoToSettings = useCallback(() => {
    router.push('/settings/settings');
  }, [router]);

  const handleViewOwnProfile = useCallback(() => {
    if (!user || !selfEntry) return;
    router.push(publicProfileHref(user.id, {
      rank: selfEntry.rank,
      points: selfEntry.points,
      period
    }));
  }, [router, user, selfEntry, period]);

  const top3 = items.slice(0, 3);
  const rest = items.slice(3);
  const showMonthBanner = period === 'month';

  return (
    <FigmaScreen
      backgroundColor={figmaColors.background}
      bottomNav={<FigmaHubBottomNav active="leaderboard" />}
      scrollProps={scrollProps}
    >
      <FigmaPageHeader
        title={leaderboardCopy.title}
        subtitle={leaderboardCopy.subtitle}
        description={leaderboardCopy.description}
        heroSource={leaderboardIcons.hero}
        guidanceKey="leaderboard"
        s={s}
        page={page}
      >
        <LeaderboardPeriodTabs
          tabs={leaderboardPeriodTabs}
          value={activeTab}
          onChange={handleTabChange}
          s={s}
          t={t}
        />
      </FigmaPageHeader>

      {showMonthBanner ? <LeaderboardResetBanner s={s} t={t} /> : null}

      {refreshing ? (
        <Text style={styles.refreshingText}>{leaderboardCopy.refreshing}</Text>
      ) : null}

      {user ? (
        <LeaderboardSelfCard
          entry={selfEntry}
          isEligible={isEligible}
          onGoToSettings={handleGoToSettings}
          onViewProfile={selfEntry ? handleViewOwnProfile : undefined}
          s={s}
          t={t}
        />
      ) : null}

      {loading ? (
        <View style={styles.centred}>
          <ActivityIndicator size="large" color={figmaColors.charcoal} />
          <Text style={styles.loadingText}>{leaderboardCopy.loading}</Text>
        </View>
      ) : error ? (
        <View style={styles.centred}>
          <Text style={styles.errorText}>{leaderboardCopy.error}</Text>
          <Pressable
            style={styles.retryBtn}
            onPress={() => void load(activeTab)}
            accessibilityRole="button"
          >
            <Text style={styles.retryText}>{leaderboardCopy.retry}</Text>
          </Pressable>
        </View>
      ) : items.length === 0 ? (
        <View style={styles.centred}>
          <Text style={styles.emptyText}>{leaderboardCopy.empty}</Text>
        </View>
      ) : (
        <>
          <LeaderboardPodium
            top3={top3}
            currentUserId={user?.id}
            onPressUser={handlePressUser}
            s={s}
            t={t}
          />

          <View style={page.sectionHeaderRow}>
            <Text style={page.sectionTitle}>{leaderboardCopy.sectionRanking}</Text>
          </View>

          {rest.length === 0 && items.length > 0 ? (
            <Text style={styles.rankingHint}>
              {leaderboardCopy.rankingListShort(items.length)}
            </Text>
          ) : null}

          {rest.map((entry) => (
            <LeaderboardRankCard
              key={entry.userId}
              rank={entry.rank}
              displayName={entry.displayName}
              username={entry.username}
              avatarUrl={entry.avatarUrl}
              points={entry.points}
              isCurrentUser={user?.id === entry.userId}
              onPress={() => handlePressUser(entry)}
              s={s}
              t={t}
            />
          ))}

          <LeaderboardPointsExplainer s={s} t={t} />
        </>
      )}

      <View style={page.ctaCard}>
        <Image source={leaderboardIcons.ctaTrophy} style={styles.ctaIcon} resizeMode="contain" />
        <View style={page.ctaTextWrap}>
          <Text style={page.ctaTitle}>{leaderboardCopy.ctaTitle}</Text>
          <Text style={page.ctaBody}>{leaderboardCopy.ctaBody}</Text>
        </View>
        <Image source={leaderboardIcons.ctaArrow} style={styles.ctaArrow} resizeMode="contain" />
      </View>
    </FigmaScreen>
  );
}

function createLocalStyles(s: (n: number) => number, t: (n: number) => number) {
  const tb = (n: number) => bodyText(t, n);

  return StyleSheet.create({
    refreshingText: {
      fontFamily: appFonts.body,
      fontSize: tb(13),
      color: figmaColors.gray,
      textAlign: 'center',
      marginBottom: s(8)
    },
    rankingHint: {
      fontFamily: appFonts.body,
      fontSize: tb(15),
      lineHeight: tb(21),
      color: figmaColors.gray,
      textAlign: 'center',
      paddingHorizontal: s(12),
      marginBottom: s(12)
    },
    centred: {
      alignItems: 'center',
      paddingVertical: s(36),
      gap: s(12)
    },
    loadingText: {
      fontFamily: appFonts.body,
      fontSize: tb(17),
      color: figmaColors.gray
    },
    errorText: {
      fontFamily: appFonts.body,
      fontSize: tb(17),
      color: figmaColors.error,
      textAlign: 'center'
    },
    emptyText: {
      fontFamily: appFonts.body,
      fontSize: tb(17),
      lineHeight: tb(24),
      color: figmaColors.gray,
      textAlign: 'center',
      paddingHorizontal: s(16)
    },
    retryBtn: {
      backgroundColor: figmaColors.buttonPrimaryBg,
      borderRadius: s(8),
      paddingHorizontal: s(24),
      paddingVertical: s(10)
    },
    retryText: {
      fontFamily: appFonts.accent,
      fontSize: tb(14),
      color: figmaColors.buttonPrimaryText,
      textTransform: 'uppercase',
      letterSpacing: 1.2
    },
    ctaIcon: {
      width: s(72),
      height: s(72)
    },
    ctaArrow: {
      width: s(32),
      height: s(21),
      marginRight: s(6)
    }
  });
}
