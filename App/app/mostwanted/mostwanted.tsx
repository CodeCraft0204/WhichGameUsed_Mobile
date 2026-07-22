import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Image, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { chipOptionsFromLabels, FigmaChipRow } from '@/components/figma/FigmaChipRow';
import { createFigmaPageStyles } from '@/components/figma/figmaPageStyles';
import { FigmaContentLoading } from '@/components/figma/FigmaContentLoading';
import { FigmaHubBottomNav } from '@/components/figma/FigmaHubBottomNav';
import { FigmaPageHeader } from '@/components/figma/FigmaPageHeader';
import { FigmaScreen } from '@/components/figma/FigmaScreen';
import { BountyRankingCard } from '@/components/most-wanted/BountyRankingCard';
import { FeaturedWantedCard } from '@/components/most-wanted/FeaturedWantedCard';
import { MostWantedSearchSort } from '@/components/most-wanted/MostWantedSearchSort';
import { MostWantedEmptyState } from '@/components/most-wanted/MostWantedShared';
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
  mostWantedRankingsHref,
  mostWantedSolvedHref,
  mostWantedSubmitHref,
  mostWantedWatchedHref
} from '@/constants/navigation';
import { figmaColors } from '@/constants/figmaColors';
import { appFonts } from '@/constants/appFonts';
import { useSocialNotifications } from '@/context/SocialNotificationsContext';
import { useFigmaLayout } from '@/hooks/useFigmaLayout';
import { useMostWantedRealtime } from '@/hooks/useMostWantedRealtime';
import {
  fetchFeaturedMostWanted,
  fetchMostWantedStats,
  listBountyRankings,
  listMostWantedHunts,
  toggleDemandVote,
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
  const scrollProps = useContextHeaderScrollProps({
    contentContainerStyle: [page.scrollContent, styles.scrollInner]
  });

  const [activeTab, setActiveTab] = useState<MostWantedFilterTab>(mostWantedFilterTabs[0]);
  const [sort, setSort] = useState<MostWantedSortKey>('most_wanted');
  const [search, setSearch] = useState('');
  const [stats, setStats] = useState<MostWantedStats>({
    activeHunts: 0,
    solvedThisMonth: 0,
    rewardPoolCents: 0,
    contributorCount: 0,
    badgesAwarded: 0
  });
  const [featured, setFeatured] = useState<MostWantedHuntRow | null>(null);
  const [items, setItems] = useState<MostWantedHuntRow[]>([]);
  const [rankings, setRankings] = useState<BountyRankingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initialLoadDone = useRef(false);

  const load = useCallback(
    async (opts?: { silent?: boolean }) => {
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
    },
    [activeTab, search, sort]
  );

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

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearch(value);
      if (searchTimer.current) clearTimeout(searchTimer.current);
      searchTimer.current = setTimeout(() => {
        void load({ silent: true });
      }, 350);
    },
    [load]
  );

  React.useEffect(() => {
    void load({ silent: initialLoadDone.current });
  }, [activeTab, sort, load]);

  const openDetail = useCallback(
    (id: string) => {
      router.push(mostWantedDetailHref(id));
    },
    [router]
  );

  const openSubmit = useCallback(
    (id: string) => {
      router.push(mostWantedSubmitHref(id));
    },
    [router]
  );

  const handleVote = useCallback(async (row: BountyRankingRow, action: 'upvote' | 'downvote') => {
    const key = row.card_request_id ?? row.card_id;
    const { voteScore, userVote, error: voteError } = await toggleDemandVote(row, action);
    if (voteError) {
      setError(voteError);
      return;
    }
    setRankings((prev) =>
      prev.map((item) =>
        (item.card_request_id ?? item.card_id) === key
          ? { ...item, vote_score: voteScore, user_vote: userVote }
          : item
      )
    );
  }, []);

  const previewRankings = rankings.slice(0, 3);

  const shortcuts = [
    { label: mostWantedCopy.shortcutsWatched, href: mostWantedWatchedHref() },
    { label: mostWantedCopy.shortcutsContributions, href: mostWantedContributionsHref() },
    { label: mostWantedCopy.shortcutsSolved, href: mostWantedSolvedHref() },
    { label: mostWantedCopy.shortcutsRankings, href: mostWantedRankingsHref() }
  ] as const;

  return (
    <FigmaScreen
      backgroundColor={figmaColors.background}
      bottomNav={<FigmaHubBottomNav active="mostwanted" />}
      scrollProps={{
        ...scrollProps,
        refreshControl: (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={figmaColors.charcoal}
          />
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
      />

      <FigmaChipRow
        options={chipOptionsFromLabels(mostWantedFilterTabs)}
        value={activeTab}
        onChange={(tab) => setActiveTab(tab as MostWantedFilterTab)}
        s={s}
        t={t}
        style={styles.chipRow}
      />

      <WantedStatsRow
        activeHunts={stats.activeHunts}
        solvedThisMonth={stats.solvedThisMonth}
        contributorCount={stats.contributorCount}
        s={s}
        t={t}
      />

      {loading ? <FigmaContentLoading message={mostWantedCopy.loading} s={s} t={t} /> : null}

      {error ? (
        <MostWantedEmptyState
          title={mostWantedCopy.errorTitle}
          body={error}
          icon="alert-circle-outline"
          s={s}
          t={t}
        />
      ) : null}

      {!loading && !error ? (
        <>
          {featured ? (
            <FeaturedWantedCard
              hunt={featured}
              s={s}
              t={t}
              onPress={() => openDetail(featured.id)}
            />
          ) : null}

          {previewRankings.length > 0 ? (
            <View style={styles.rankingsSection}>
              <View style={styles.rankingsHeader}>
                <Image
                  source={mostWantedIcons.trophy}
                  style={styles.rankingsTrophy}
                  resizeMode="contain"
                />
                <Text style={styles.rankingsTitle}>{mostWantedCopy.bountyRankingsTitle}</Text>
                <Pressable
                  onPress={() => router.push(mostWantedRankingsHref())}
                  style={styles.viewAll}
                  accessibilityRole="button"
                  accessibilityLabel="View all community priority"
                >
                  <Text style={styles.viewAllText}>VIEW ALL</Text>
                  <Image
                    source={mostWantedIcons.ctaArrow}
                    style={styles.viewAllArrow}
                    resizeMode="contain"
                  />
                </Pressable>
              </View>
              <Text style={styles.rankingsSubtitle}>{mostWantedCopy.bountyRankingsSubtitle}</Text>
              {previewRankings.map((row, index) => (
                <BountyRankingCard
                  key={row.card_request_id ?? row.card_id ?? `${row.card_title}-${index}`}
                  row={row}
                  rank={index + 1}
                  s={s}
                  t={t}
                  onVote={(action) => void handleVote(row, action)}
                />
              ))}
            </View>
          ) : null}

          <MostWantedSearchSort
            search={search}
            sort={sort}
            onSearchChange={handleSearchChange}
            onSortChange={setSort}
            s={s}
            t={t}
          />

          <View style={page.sectionHeaderRow}>
            <Text style={page.sectionTitle}>{mostWantedCopy.activeListTitle}</Text>
          </View>

          {items.length === 0 && !featured ? (
            <MostWantedEmptyState
              title={mostWantedCopy.emptyTitle}
              body={mostWantedCopy.emptyBody}
              s={s}
              t={t}
            />
          ) : null}

          {items.map((hunt, index) => (
            <WantedCard
              key={hunt.id}
              hunt={hunt}
              rank={index + 1}
              s={s}
              t={t}
              onPress={() => openDetail(hunt.id)}
              onContribute={() => openSubmit(hunt.id)}
            />
          ))}
        </>
      ) : null}

      <View style={styles.shortcutRow}>
        {shortcuts.map((item) => (
          <Pressable
            key={item.label}
            style={styles.shortcutPill}
            onPress={() => router.push(item.href)}
            accessibilityRole="button"
            accessibilityLabel={item.label}
          >
            <Text style={styles.shortcutText}>{item.label}</Text>
          </Pressable>
        ))}
      </View>
    </FigmaScreen>
  );
}

function createLocalStyles(s: (n: number) => number, t: (n: number) => number) {
  return StyleSheet.create({
    scrollInner: { flexGrow: 1 },
    chipRow: { marginTop: s(4), marginBottom: s(10) },
    rankingsSection: { marginBottom: s(16) },
    rankingsHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(8),
      marginBottom: s(4)
    },
    rankingsTrophy: { width: s(18), height: s(16) },
    rankingsTitle: {
      flex: 1,
      fontFamily: appFonts.bodyBold,
      fontSize: t(16),
      letterSpacing: 0.4,
      color: figmaColors.brown
    },
    rankingsSubtitle: {
      fontFamily: appFonts.body,
      fontSize: t(12),
      color: figmaColors.grayMuted,
      marginBottom: s(8)
    },
    viewAll: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(5)
    },
    viewAllText: {
      fontFamily: appFonts.accent,
      fontSize: t(12),
      letterSpacing: 0.4,
      color: figmaColors.brownMuted
    },
    viewAllArrow: { width: s(10), height: s(9) },
    shortcutRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: s(8),
      marginTop: 'auto' as const,
      paddingTop: s(16),
      paddingBottom: s(8)
    },
    shortcutPill: {
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      backgroundColor: figmaColors.cream,
      borderRadius: s(999),
      paddingHorizontal: s(12),
      paddingVertical: s(8)
    },
    shortcutText: {
      fontFamily: appFonts.accent,
      fontSize: t(12),
      color: figmaColors.charcoal,
      letterSpacing: 0.4
    }
  });
}
