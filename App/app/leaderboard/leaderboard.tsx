import { useFocusEffect, useRouter } from 'expo-router';
import { appFonts } from '@/constants/appFonts';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { createFigmaPageStyles } from '@/components/figma/figmaPageStyles';
import { FigmaContentLoading } from '@/components/figma/FigmaContentLoading';
import { FigmaHubBottomNav } from '@/components/figma/FigmaHubBottomNav';
import { FigmaPageHeader } from '@/components/figma/FigmaPageHeader';
import { FigmaScreen } from '@/components/figma/FigmaScreen';
import { LeaderboardPeriodTabs } from '@/components/figma/LeaderboardPeriodTabs';
import { LeaderboardPodium } from '@/components/figma/LeaderboardPodium';
import { LeaderboardPointsExplainer } from '@/components/figma/LeaderboardPointsExplainer';
import { LeaderboardPrizeCard } from '@/components/figma/LeaderboardPrizeCard';
import { LeaderboardRankCard } from '@/components/figma/LeaderboardRankCard';
import { LeaderboardResetBanner } from '@/components/figma/LeaderboardResetBanner';
import { LeaderboardSelfCard } from '@/components/figma/LeaderboardSelfCard';
import {
  ContextHeaderScrollProvider,
  useContextHeaderScrollProps
} from '@/context/ContextHeaderScrollContext';
import { leaderboardIcons, leaderboardPeriodTabs } from '@/constants/leaderboardContent';
import { leaderboardCopy } from '@/constants/leaderboardCopy';
import { publicProfileHref, pointsWorkHref, monthlyPrizeHref, messagesInboxHref } from '@/constants/navigation';
import { figmaColors } from '@/constants/figmaColors';
import { bodyText } from '@/constants/appTypography';
import { useAuth } from '@/context/AuthContext';
import { useSocialNotifications } from '@/context/SocialNotificationsContext';
import { useFigmaLayout } from '@/hooks/useFigmaLayout';import { useLeaderboardRealtime } from '@/hooks/useLeaderboardRealtime';
import {
  fetchActiveMonthlyPrize,
  getMyStanding,
  listLeaderboard,
  type LeaderboardEntry,
  type LeaderboardPeriod,
  type MonthlyPrize
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
  const { unreadInboxCount, refreshCounts } = useSocialNotifications();
  const { s, t } = useFigmaLayout(0.92);
  const page = useMemo(() => createFigmaPageStyles(s, t), [s, t]);
  const styles = useMemo(() => createLocalStyles(s, t), [s, t]);
  const scrollProps = useContextHeaderScrollProps({
    contentContainerStyle: [page.scrollContent, styles.scrollInner]
  });

  const [activeTab, setActiveTab] = useState<(typeof leaderboardPeriodTabs)[number]>(
    leaderboardPeriodTabs[0]
  );
  const [items, setItems] = useState<LeaderboardEntry[]>([]);
  const [selfEntry, setSelfEntry] = useState<LeaderboardEntry | null>(null);
  const [monthlyPrize, setMonthlyPrize] = useState<MonthlyPrize | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const initialLoadDone = useRef(false);

  const period = tabToPeriod(activeTab);

  const load = useCallback(async (tab: string, opts?: { silent?: boolean }) => {
    const silent = opts?.silent && initialLoadDone.current;
    if (!silent) setLoading(true);
    else setRefreshing(true);

    setError(null);
    const p = tabToPeriod(tab);
    const standingPromise = user
      ? getMyStanding(user.id, p)
      : Promise.resolve({ entry: null, rank: null, error: null });
    const [rankResult, prizeResult, standingResult] = await Promise.all([
      listLeaderboard(p, 20),
      fetchActiveMonthlyPrize(),
      standingPromise
    ]);

    if (rankResult.error) {
      setError(rankResult.error);
      setItems([]);
    } else {
      setItems(rankResult.items);
    }
    setSelfEntry(standingResult.entry);
    setMonthlyPrize(prizeResult.prize);
    setLoading(false);
    setRefreshing(false);
    initialLoadDone.current = true;
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      void load(activeTab);
      void refreshCounts();
    }, [activeTab, load, refreshCounts])
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

  const handleViewPointsWork = useCallback(() => {
    router.push(pointsWorkHref());
  }, [router]);

  const handleOpenMessages = useCallback(() => {
    router.push(messagesInboxHref());
  }, [router]);

  const handleViewMonthlyPrize = useCallback(() => {
    router.push(monthlyPrizeHref());
  }, [router]);

  const handleViewSelfProfile = useCallback(() => {
    if (!user) return;
    router.push(publicProfileHref(user.id, {
      rank: selfEntry?.rank,
      points: selfEntry?.points,
      period
    }));
  }, [router, selfEntry?.points, selfEntry?.rank, period, user]);

  const handleOpenSettings = useCallback(() => {
    router.push('/settings/settings');
  }, [router]);

  const top3 = items.slice(0, 3);
  const showMonthBanner = period === 'month';
  const rankingHint = leaderboardCopy.rankingListShort(items.length);

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
        showUtilityMessages={Boolean(user)}
        utilityMessagesUnreadCount={unreadInboxCount}
        onPressUtilityMessages={handleOpenMessages}
      >
        <LeaderboardPeriodTabs
          tabs={leaderboardPeriodTabs}
          value={activeTab}
          onChange={handleTabChange}
          s={s}
          t={t}
        />
      </FigmaPageHeader>

      {loading ? (
        <FigmaContentLoading message={leaderboardCopy.loading} s={s} t={t} />
      ) : (
        <>
          {showMonthBanner ? (
            <LeaderboardResetBanner s={s} t={t} prize={monthlyPrize} />
          ) : null}

          {user ? (
            <LeaderboardSelfCard
              entry={selfEntry}
              isEligible={profile?.leaderboard_eligible ?? true}
              onGoToSettings={handleOpenSettings}
              onViewProfile={handleViewSelfProfile}
              s={s}
              t={t}
            />
          ) : null}

          {refreshing ? (
            <Text style={styles.refreshingText}>{leaderboardCopy.refreshing}</Text>
          ) : null}

          {error ? (
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
              {top3.length > 0 ? (
                <LeaderboardPodium
                  top3={top3}
                  currentUserId={user?.id}
                  onPressUser={handlePressUser}
                  s={s}
                  t={t}
                />
              ) : null}

              <View style={styles.sectionHeader}>
                <Text style={page.sectionTitle}>{leaderboardCopy.sectionRanking}</Text>
                <Text style={styles.pointsHeader}>{leaderboardCopy.pointsColumn}</Text>
              </View>

              {rankingHint ? (
                <Text style={styles.rankingHint}>{rankingHint}</Text>
              ) : null}

              {items.map((entry) => (
                <LeaderboardRankCard
                  key={entry.userId}
                  userId={entry.userId}
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
            </>
          )}
        </>
      )}

      <View style={styles.bottomCards}>
        <LeaderboardPointsExplainer s={s} t={t} onSeeAll={handleViewPointsWork} />
        {period === 'month' ? (
          <LeaderboardPrizeCard
            prize={monthlyPrize}
            s={s}
            t={t}
            onLearnMore={handleViewMonthlyPrize}
          />
        ) : null}
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
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderTopWidth: 1,
      borderTopColor: figmaColors.divider,
      paddingTop: s(8),
      marginBottom: s(8)
    },
    pointsHeader: {
      fontFamily: appFonts.accent,
      fontSize: tb(14),
      color: figmaColors.gray,
      textTransform: 'uppercase',
      letterSpacing: 0.8
    },
    rankingHint: {
      fontFamily: appFonts.body,
      fontSize: tb(17),
      lineHeight: tb(24),
      color: figmaColors.gray,
      textAlign: 'center',
      paddingHorizontal: s(12),
      marginBottom: s(12)
    },
    scrollInner: {
      flexGrow: 1
    },
    bottomCards: {
      flexDirection: 'row',
      gap: s(8),
      marginTop: 'auto' as const,
      marginBottom: s(8),
      paddingTop: s(16),
      alignItems: 'stretch'
    },
    centred: {
      alignItems: 'center',
      paddingVertical: s(36),
      gap: s(12)
    },
    errorText: {
      fontFamily: appFonts.body,
      fontSize: tb(19),
      color: figmaColors.error,
      textAlign: 'center'
    },
    emptyText: {
      fontFamily: appFonts.body,
      fontSize: tb(19),
      lineHeight: tb(26),
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
    }
  });
}
