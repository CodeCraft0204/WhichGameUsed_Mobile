import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { chipOptionsFromLabels, FigmaChipRow } from '@/components/figma/FigmaChipRow';
import { createFigmaPageStyles } from '@/components/figma/figmaPageStyles';
import { FigmaHubBottomNav } from '@/components/figma/FigmaHubBottomNav';
import { FigmaPageHeader } from '@/components/figma/FigmaPageHeader';
import { FigmaScreen } from '@/components/figma/FigmaScreen';
import { BountyRankingCard } from '@/components/most-wanted/BountyRankingCard';
import { FeaturedWantedCard } from '@/components/most-wanted/FeaturedWantedCard';
import { MostWantedSearchSort } from '@/components/most-wanted/MostWantedSearchSort';
import { WantedCard } from '@/components/most-wanted/WantedCard';
import { WantedStatsRow } from '@/components/most-wanted/WantedStatsRow';
import {
  ContextHeaderScrollProvider,
  useContextHeaderScrollProps
} from '@/context/ContextHeaderScrollContext';
import { mostWantedIcons } from '@/constants/mostWantedContent';
import {
  mostWantedCopy,
  mostWantedFilterTabs,
  type MostWantedFilterTab,
  type MostWantedSortKey
} from '@/constants/mostWantedCopy';
import {
  messagesInboxHref,
  mostWantedContributionsHref,
  mostWantedDetailHref,
  mostWantedSolvedHref,
  mostWantedSubmitHref,
  mostWantedWatchedHref
} from '@/constants/navigation';
import { figmaColors } from '@/constants/figmaColors';
import { useSocialNotifications } from '@/context/SocialNotificationsContext';
import { useFigmaLayout } from '@/hooks/useFigmaLayout';
import { useMostWantedRealtime } from '@/hooks/useMostWantedRealtime';
import {
  fetchFeaturedMostWanted,
  fetchMostWantedStats,
  listBountyRankings,
  listMostWantedHunts,
  toggleCardRequestVote,
  type BountyRankingRow,
  type MostWantedHuntRow,
  type MostWantedStats
} from '@/lib/most-wanted';

export default function MostWantedScreen() {
  return (
    <ContextHeaderScrollProvider>
      <MostWantedScreenBody />
    </ContextHeaderScrollProvider>
  );
}

function MostWantedScreenBody() {
  const router = useRouter();
  const { unreadInboxCount, refreshCounts } = useSocialNotifications();
  const { s, t } = useFigmaLayout();
  const page = useMemo(() => createFigmaPageStyles(s, t), [s, t]);
  const styles = useMemo(() => createLocalStyles(s, t), [s, t]);
  const scrollProps = useContextHeaderScrollProps({ contentContainerStyle: page.scrollContent });

  const [activeTab, setActiveTab] = useState<MostWantedFilterTab>(mostWantedFilterTabs[0]);
  const [sort, setSort] = useState<MostWantedSortKey>('most_wanted');
  const [search, setSearch] = useState('');
  const [stats, setStats] = useState<MostWantedStats>({ activeHunts: 0, solvedThisMonth: 0, rewardPoolCents: 0 });
  const [featured, setFeatured] = useState<MostWantedHuntRow | null>(null);
  const [items, setItems] = useState<MostWantedHuntRow[]>([]);
  const [rankings, setRankings] = useState<BountyRankingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initialLoadDone = useRef(false);

  const load = useCallback(async (opts?: { silent?: boolean }) => {
    const silent = opts?.silent && initialLoadDone.current;
    if (!silent) setLoading(true);
    setError(null);

    const [statsRes, featuredRes, listRes, rankingsRes] = await Promise.all([
      fetchMostWantedStats(),
      fetchFeaturedMostWanted(),
      listMostWantedHunts({ filter: activeTab, sort, search }),
      listBountyRankings(8)
    ]);

    if (statsRes.stats) setStats(statsRes.stats);
    setFeatured(featuredRes.item);
    if (listRes.error) {
      setError(listRes.error);
      setItems([]);
    } else {
      const list = listRes.items.filter((row) => row.id !== featuredRes.item?.id);
      setItems(list);
    }
    setRankings(rankingsRes.items);

    setLoading(false);
    setRefreshing(false);
    initialLoadDone.current = true;
  }, [activeTab, search, sort]);

  useFocusEffect(
    useCallback(() => {
      void load();
      void refreshCounts();
    }, [load, refreshCounts])
  );

  useMostWantedRealtime(() => void load({ silent: true }), initialLoadDone.current);

  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    void load({ silent: true });
  }, [load]);

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      void load({ silent: true });
    }, 350);
  }, [load]);

  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab as MostWantedFilterTab);
  }, []);

  const handleSortChange = useCallback((next: MostWantedSortKey) => {
    setSort(next);
  }, []);

  React.useEffect(() => {
    void load({ silent: initialLoadDone.current });
  }, [activeTab, sort, load]);

  const openDetail = useCallback((id: string) => {
    router.push(mostWantedDetailHref(id));
  }, [router]);

  const openSubmit = useCallback((id: string) => {
    router.push(mostWantedSubmitHref(id));
  }, [router]);

  const handleVote = useCallback(async (cardRequestId: string, action: 'upvote' | 'downvote') => {
    const { voteScore, userVote, error: voteError } = await toggleCardRequestVote(cardRequestId, action);
    if (voteError) {
      setError(voteError);
      return;
    }
    setRankings((prev) =>
      prev.map((row) =>
        row.card_request_id === cardRequestId
          ? { ...row, vote_score: voteScore, user_vote: userVote }
          : row
      )
    );
  }, []);

  return (
    <FigmaScreen
      backgroundColor={figmaColors.background}
      bottomNav={<FigmaHubBottomNav active="mostwanted" />}
      scrollProps={{
        ...scrollProps,
        refreshControl: (
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={figmaColors.charcoal} />
        )
      }}
    >
      <FigmaPageHeader
        title={mostWantedCopy.pageTitle}
        subtitle={mostWantedCopy.pageSubtitle}
        description={mostWantedCopy.pageDescription}
        heroSource={mostWantedIcons.hero}
        guidanceKey="mostwanted"
        showUtilityMessages
        utilityMessagesUnreadCount={unreadInboxCount}
        onPressUtilityMessages={() => router.push(messagesInboxHref())}
        s={s}
        page={page}
      >
        <FigmaChipRow
          options={chipOptionsFromLabels(mostWantedFilterTabs)}
          value={activeTab}
          onChange={handleTabChange}
          s={s}
          t={t}
          style={styles.chipRow}
        />
      </FigmaPageHeader>

      <WantedStatsRow
        activeHunts={stats.activeHunts}
        solvedThisMonth={stats.solvedThisMonth}
        rewardPoolCents={stats.rewardPoolCents}
        s={s}
        t={t}
      />

      <MostWantedSearchSort
        search={search}
        sort={sort}
        onSearchChange={handleSearchChange}
        onSortChange={handleSortChange}
        s={s}
        t={t}
      />

      {rankings.length > 0 ? (
        <View style={styles.rankingsSection}>
          <Text style={page.sectionTitle}>{mostWantedCopy.bountyRankingsTitle}</Text>
          <Text style={styles.rankingsSubtitle}>{mostWantedCopy.bountyRankingsSubtitle}</Text>
          {rankings.map((row) => (
            <BountyRankingCard
              key={row.card_request_id}
              row={row}
              s={s}
              t={t}
              onVote={(action) => void handleVote(row.card_request_id, action)}
            />
          ))}
        </View>
      ) : null}

      <View style={page.sectionHeaderRow}>
        <Text style={page.sectionTitle}>ACTIVE HUNTS</Text>
        <View style={styles.linkRow}>
          <Pressable onPress={() => router.push(mostWantedSolvedHref())}>
            <Text style={styles.linkText}>Solved</Text>
          </Pressable>
          <Text style={styles.linkDivider}>·</Text>
          <Pressable onPress={() => router.push(mostWantedWatchedHref())}>
            <Text style={styles.linkText}>Watching</Text>
          </Pressable>
          <Text style={styles.linkDivider}>·</Text>
          <Pressable onPress={() => router.push(mostWantedContributionsHref())}>
            <Text style={styles.linkText}>My Contributions</Text>
          </Pressable>
        </View>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={figmaColors.charcoal} />
          <Text style={styles.muted}>{mostWantedCopy.loading}</Text>
        </View>
      ) : null}

      {error ? (
        <View style={styles.center}>
          <Text style={styles.errorTitle}>{mostWantedCopy.errorTitle}</Text>
          <Text style={styles.muted}>{error}</Text>
          <Pressable onPress={() => void load()} style={styles.retryBtn}>
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      ) : null}

      {!loading && !error && featured ? (
        <FeaturedWantedCard
          hunt={featured}
          s={s}
          t={t}
          onPress={() => openDetail(featured.id)}
        />
      ) : null}

      {!loading && !error && items.length === 0 && !featured ? (
        <View style={styles.center}>
          <Text style={styles.errorTitle}>{mostWantedCopy.emptyTitle}</Text>
          <Text style={styles.muted}>{mostWantedCopy.emptyBody}</Text>
        </View>
      ) : null}

      {!error
        ? items.map((hunt) => (
            <WantedCard
              key={hunt.id}
              hunt={hunt}
              s={s}
              t={t}
              onPress={() => openDetail(hunt.id)}
              onContribute={() => openSubmit(hunt.id)}
            />
          ))
        : null}
    </FigmaScreen>
  );
}

function createLocalStyles(s: (n: number) => number, t: (n: number) => number) {
  return StyleSheet.create({
    chipRow: {
      marginTop: s(20),
      marginBottom: 0
    },
    linkRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(6)
    },
    linkText: {
      fontFamily: 'EBGaramond_400Regular',
      fontSize: t(13),
      color: figmaColors.accent
    },
    linkDivider: {
      color: figmaColors.gray
    },
    center: {
      alignItems: 'center',
      paddingVertical: s(24),
      gap: s(8)
    },
    muted: {
      fontFamily: 'EBGaramond_400Regular',
      fontSize: t(14),
      color: figmaColors.gray,
      textAlign: 'center'
    },
    errorTitle: {
      fontFamily: 'EBGaramond_600SemiBold',
      fontSize: t(16),
      color: figmaColors.charcoal
    },
    retryBtn: {
      marginTop: s(8),
      paddingHorizontal: s(16),
      paddingVertical: s(8),
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      borderRadius: s(8)
    },
    retryText: {
      fontFamily: 'EBGaramond_400Regular',
      fontSize: t(14),
      color: figmaColors.charcoal
    },
    rankingsSection: {
      marginBottom: s(16)
    },
    rankingsSubtitle: {
      fontFamily: 'EBGaramond_400Regular',
      fontSize: t(13),
      color: figmaColors.gray,
      marginBottom: s(10)
    }
  });
}
