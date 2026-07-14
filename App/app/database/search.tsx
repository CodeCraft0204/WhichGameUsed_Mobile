import { Ionicons } from '@expo/vector-icons';
import { appFonts } from '@/constants/appFonts';
import { bodyText } from '@/constants/appTypography';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DatabaseChipRow } from '@/components/database/DatabaseChipRow';
import { DatabaseFilterSheet, DatabaseSortSheet } from '@/components/database/DatabaseSheet';
import { DatabaseStatsBar } from '@/components/database/DatabaseStatsBar';
import { DatabaseToolbox } from '@/components/database/DatabaseToolbox';
import { DatabaseRecordCard } from '@/components/figma/DatabaseRecordCard';
import { ProfileSubpageHeader } from '@/components/profile/ProfileSubpageHeader';
import {
  databaseFeaturedRecords,
  databaseIcons,
  type DatabaseMetaItem
} from '@/constants/databaseContent';
import { databaseCopy } from '@/constants/databaseCopy';
import {
  databaseSportTabs,
  databaseYearRanges,
  defaultDatabaseFilters,
  yearRangeToBounds,
  type DatabaseFilterState,
  type YearRangeKey
} from '@/constants/databaseFilters';
import { figmaColors } from '@/constants/figmaColors';
import { databaseCardHref, databaseWishlistAddHref, databaseWishlistHref } from '@/constants/navigation';
import { useFigmaLayout } from '@/hooks/useFigmaLayout';
import {
  cardDescription,
  cardToTags,
  getCatalogStats,
  listCatalogCards,
  type CardSummary,
  type CatalogSort,
  type DatabaseSportFilter
} from '@/lib/cards';
import { listMyWishlist } from '@/lib/wishlist';

const PAGE_SIZE = 30;

function cardToMeta(card: CardSummary): DatabaseMetaItem[] {
  const meta: DatabaseMetaItem[] = [];
  if (card.player_name) meta.push({ key: 'player', icon: 'person', label: card.player_name });
  if (card.team_name) meta.push({ key: 'team', icon: 'baseball', label: card.team_name });
  if (card.year) meta.push({ key: 'year', icon: 'calendar', label: String(card.year) });
  if (card.authenticated_count > 0) {
    meta.push({
      key: 'auth',
      icon: 'shield',
      label: databaseCopy.authCount(card.authenticated_count)
    });
  }
  return meta;
}

function countActiveFilters(filters: DatabaseFilterState): number {
  let n = 0;
  if (filters.authenticatedOnly) n += 1;
  if (filters.memorabiliaType?.trim()) n += 1;
  return n;
}

export default function DatabaseSearchScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ q?: string; sport?: string; authenticated?: string }>();
  const { s, t } = useFigmaLayout();
  const styles = useMemo(() => createStyles(s, t), [s, t]);

  const initialSport = (params.sport?.toUpperCase() as DatabaseSportFilter) || 'ALL';
  const [query, setQuery] = useState(typeof params.q === 'string' ? params.q : '');
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  const [filters, setFilters] = useState<DatabaseFilterState>({
    ...defaultDatabaseFilters,
    sport: databaseSportTabs.includes(initialSport as DatabaseSportFilter) ? initialSport : 'ALL',
    authenticatedOnly: params.authenticated === '1'
  });
  const [draftAuthOnly, setDraftAuthOnly] = useState(filters.authenticatedOnly);
  const [draftMemorabilia, setDraftMemorabilia] = useState(filters.memorabiliaType ?? '');
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [results, setResults] = useState<CardSummary[]>([]);
  const [loadingMore, setLoadingMore] = useState(false);
  const [totalCards, setTotalCards] = useState(0);
  const [authenticatedCards, setAuthenticatedCards] = useState(0);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(
    async (append = false, startOffset = 0) => {
      if (append) setLoadingMore(true);
      else setLoading(true);

      const yearBounds = yearRangeToBounds(filters.yearRange);
      const listOpts = {
        query: debouncedQuery,
        sport: filters.sport,
        authenticatedOnly: filters.authenticatedOnly,
        memorabiliaType: filters.memorabiliaType,
        sort: filters.sort,
        ...yearBounds,
        limit: PAGE_SIZE,
        offset: startOffset
      };

      const [cardsRes, statsRes, wishRes] = await Promise.all([
        listCatalogCards(listOpts),
        getCatalogStats({
          query: debouncedQuery,
          sport: filters.sport,
          authenticatedOnly: filters.authenticatedOnly,
          memorabiliaType: filters.memorabiliaType,
          ...yearBounds
        }),
        listMyWishlist()
      ]);

      setResults((prev) => (append ? [...prev, ...cardsRes.items] : cardsRes.items));
      setError(cardsRes.error ?? statsRes.error);
      setTotalCards(statsRes.stats.totalCards);
      setAuthenticatedCards(statsRes.stats.authenticatedCards);
      setWishlistCount(wishRes.items.length);
      setLoading(false);
      setLoadingMore(false);
    },
    [
      debouncedQuery,
      filters.sport,
      filters.yearRange,
      filters.authenticatedOnly,
      filters.memorabiliaType,
      filters.sort
    ]
  );

  useEffect(() => {
    void loadData(false, 0);
  }, [loadData]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  const hasMore = results.length < totalCards;

  const applyFilters = () => {
    setFilters((prev) => ({
      ...prev,
      authenticatedOnly: draftAuthOnly,
      memorabiliaType: draftMemorabilia.trim() || null
    }));
    setFilterOpen(false);
  };

  const clearFilters = () => {
    setDraftAuthOnly(false);
    setDraftMemorabilia('');
    setFilters((prev) => ({
      ...prev,
      authenticatedOnly: false,
      memorabiliaType: null
    }));
    setFilterOpen(false);
  };

  const listHeader = (
    <View>
      <ProfileSubpageHeader
        title={databaseCopy.searchTitle}
        s={s}
        t={t}
        onBack={() => router.back()}
      />

      <DatabaseStatsBar
        totalCards={totalCards}
        authenticatedCards={authenticatedCards}
        s={s}
        t={t}
      />

      <View style={styles.searchRow}>
        <Ionicons name="search" size={s(20)} color={figmaColors.gray} style={styles.searchIcon} />
        <TextInput
          style={styles.input}
          value={query}
          onChangeText={setQuery}
          placeholder={databaseCopy.searchPlaceholder}
          placeholderTextColor={figmaColors.textMuted}
          autoCapitalize="none"
          autoCorrect={false}
          clearButtonMode="while-editing"
        />
      </View>

      <DatabaseToolbox
        onFilter={() => {
          setDraftAuthOnly(filters.authenticatedOnly);
          setDraftMemorabilia(filters.memorabiliaType ?? '');
          setFilterOpen(true);
        }}
        onSort={() => setSortOpen(true)}
        onWishlist={() => router.push(databaseWishlistHref())}
        wishlistCount={wishlistCount}
        activeFilterCount={countActiveFilters(filters)}
        s={s}
        t={t}
      />

      <DatabaseChipRow
        label={databaseCopy.browseBySport}
        options={databaseSportTabs.map((key) => ({ key, label: key }))}
        value={filters.sport}
        onChange={(sport) => setFilters((prev) => ({ ...prev, sport }))}
        s={s}
        t={t}
      />

      <DatabaseChipRow
        label={databaseCopy.browseByYear}
        options={databaseYearRanges.map((r) => ({ key: r.key, label: r.label }))}
        value={filters.yearRange}
        onChange={(yearRange) =>
          setFilters((prev) => ({ ...prev, yearRange: yearRange as YearRangeKey }))
        }
        s={s}
        t={t}
      />

      <Text style={styles.resultsMeta}>
        {loading ? 'Loading…' : databaseCopy.resultsCount(results.length)}
        {!loading && totalCards > results.length ? ` of ${totalCards.toLocaleString()}` : ''}
      </Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.list}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyWrap}>
              <Text style={styles.empty}>
                {debouncedQuery.trim() ? databaseCopy.searchEmpty : databaseCopy.recentEmpty}
              </Text>
              {debouncedQuery.trim() ? (
                <Pressable
                  style={styles.emptyCta}
                  onPress={() =>
                    router.push(databaseWishlistAddHref({ query: debouncedQuery.trim() }))
                  }
                  accessibilityRole="button"
                >
                  <Text style={styles.emptyCtaTitle}>{databaseCopy.searchEmptyCtaTitle}</Text>
                  <Text style={styles.emptyCtaBody}>{databaseCopy.searchEmptyCtaBody}</Text>
                  <Text style={styles.emptyLink}>{databaseCopy.requestAddLink}</Text>
                </Pressable>
              ) : null}
            </View>
          ) : null
        }
        ListFooterComponent={
          loading && results.length === 0 ? (
            <ActivityIndicator style={styles.loader} color={figmaColors.charcoal} />
          ) : hasMore ? (
            <Pressable
              style={styles.loadMore}
              disabled={loadingMore}
              onPress={() => void loadData(true, results.length)}
            >
              {loadingMore ? (
                <ActivityIndicator color={figmaColors.charcoal} />
              ) : (
                <Text style={styles.loadMoreText}>{databaseCopy.loadMore}</Text>
              )}
            </Pressable>
          ) : null
        }
        renderItem={({ item, index }) => (
          <DatabaseRecordCard
            cardImage={
              databaseFeaturedRecords[index % databaseFeaturedRecords.length]?.cardImage ??
              databaseIcons.recordMantle
            }
            imageUrl={item.imageUrl}
            title={item.title}
            description={cardDescription(item)}
            tags={cardToTags(item)}
            meta={cardToMeta(item)}
            variant="featured"
            s={s}
            t={t}
            onPress={() => router.push(databaseCardHref(item.id))}
          />
        )}
      />

      <DatabaseFilterSheet
        visible={filterOpen}
        authenticatedOnly={draftAuthOnly}
        memorabiliaType={draftMemorabilia}
        onAuthenticatedOnlyChange={setDraftAuthOnly}
        onMemorabiliaTypeChange={setDraftMemorabilia}
        onApply={applyFilters}
        onClear={clearFilters}
        onClose={() => setFilterOpen(false)}
        s={s}
        t={t}
      />

      <DatabaseSortSheet
        visible={sortOpen}
        value={filters.sort}
        onChange={(sort: CatalogSort) => setFilters((prev) => ({ ...prev, sort }))}
        onClose={() => setSortOpen(false)}
        s={s}
        t={t}
      />
    </SafeAreaView>
  );
}

function createStyles(s: (n: number) => number, t: (n: number) => number) {
  const tb = (n: number) => bodyText(t, n);

  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: figmaColors.background },
    list: { paddingHorizontal: s(16), paddingBottom: s(24) },
    searchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      borderRadius: s(12),
      backgroundColor: figmaColors.cream,
      marginBottom: s(14),
      paddingHorizontal: s(12)
    },
    searchIcon: { marginRight: s(8) },
    input: {
      flex: 1,
      paddingVertical: s(14),
      fontFamily: appFonts.body,
      fontSize: tb(17),
      color: figmaColors.charcoal
    },
    resultsMeta: {
      fontFamily: appFonts.body,
      fontSize: tb(16),
      color: figmaColors.gray,
      marginBottom: s(12)
    },
    loader: { marginVertical: s(16) },
    error: {
      marginBottom: s(8),
      fontFamily: appFonts.body,
      fontSize: tb(14),
      color: figmaColors.error
    },
    empty: {
      fontFamily: appFonts.body,
      fontSize: tb(17),
      lineHeight: tb(24),
      color: figmaColors.gray,
      textAlign: 'center'
    },
    emptyWrap: {
      alignItems: 'center',
      gap: s(12),
      marginTop: s(24),
      paddingHorizontal: s(12)
    },
    emptyCta: {
      width: '100%',
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      borderRadius: s(14),
      backgroundColor: figmaColors.cream,
      paddingHorizontal: s(16),
      paddingVertical: s(16),
      gap: s(8)
    },
    emptyCtaTitle: {
      fontFamily: appFonts.bodyBold,
      fontSize: tb(18),
      color: figmaColors.charcoal,
      textAlign: 'center'
    },
    emptyCtaBody: {
      fontFamily: appFonts.body,
      fontSize: tb(15),
      lineHeight: tb(22),
      color: figmaColors.gray,
      textAlign: 'center'
    },
    emptyLink: {
      fontFamily: appFonts.bodyBold,
      fontSize: tb(15),
      color: figmaColors.bronze,
      textAlign: 'center',
      marginTop: s(4)
    },
    loadMore: {
      alignItems: 'center',
      paddingVertical: s(20)
    },
    loadMoreText: {
      fontFamily: appFonts.accent,
      fontSize: tb(15),
      color: figmaColors.charcoal,
      letterSpacing: 0.8
    }
  });
}
