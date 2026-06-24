import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
import { DatabaseChipRow } from '@/components/database/DatabaseChipRow';
import { DatabaseStatsBar } from '@/components/database/DatabaseStatsBar';
import { DatabaseRecordCard } from '@/components/figma/DatabaseRecordCard';
import { FigmaDatabaseBottomNav } from '@/components/figma/FigmaDatabaseBottomNav';
import { createFigmaPageStyles } from '@/components/figma/figmaPageStyles';
import { FigmaPageHeader } from '@/components/figma/FigmaPageHeader';
import { AppAnnouncementBanner } from '@/components/AppAnnouncementBanner';
import { FigmaScreen } from '@/components/figma/FigmaScreen';
import { databaseIcons, type DatabaseMetaItem, type DatabaseRecord } from '@/constants/databaseContent';
import { appFonts } from '@/constants/appFonts';
import { bodyText } from '@/constants/appTypography';
import { databaseCopy } from '@/constants/databaseCopy';
import { databaseSportTabs } from '@/constants/databaseFilters';
import { figmaColors } from '@/constants/figmaColors';
import { databaseCardHref, databaseSearchHref, databaseWishlistHref } from '@/constants/navigation';
import { useFigmaLayout } from '@/hooks/useFigmaLayout';
import {
  cardDescription,
  cardToTags,
  getCatalogStats,
  listCatalogCards,
  listRecentCards,
  listTrendingCards,
  type CardSummary,
  type DatabaseSportFilter
} from '@/lib/cards';

const SEARCH_DEBOUNCE_MS = 300;
const SEARCH_PAGE_SIZE = 50;

type LiveRecord = DatabaseRecord & { imageUrl?: string | null; cardId?: string };

function cardToLiveRecord(card: CardSummary, cardImage: number): LiveRecord {
  const meta: DatabaseMetaItem[] = [];
  if (card.player_name) meta.push({ key: 'player', icon: 'person', label: card.player_name });
  if (card.team_name) meta.push({ key: 'team', icon: 'baseball', label: card.team_name });
  if (card.year) meta.push({ key: 'year', icon: 'calendar', label: String(card.year) });
  if (card.authenticated_count > 0) {
    meta.push({ key: 'auth', icon: 'shield', label: databaseCopy.authCount(card.authenticated_count) });
  }

  return {
    key: card.id,
    cardId: card.id,
    cardImage,
    imageUrl: card.imageUrl,
    title: card.title,
    description: cardDescription(card),
    tags: cardToTags(card),
    meta
  };
}

export default function DatabaseScreen() {
  const router = useRouter();
  const { id: focusCardId } = useLocalSearchParams<{ id?: string }>();
  const { s, t } = useFigmaLayout();
  const page = useMemo(() => createFigmaPageStyles(s, t), [s, t]);
  const styles = useMemo(() => createLocalStyles(s, t), [s, t]);

  const [activeSport, setActiveSport] = useState<DatabaseSportFilter>('ALL');
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [featured, setFeatured] = useState<LiveRecord[]>([]);
  const [recent, setRecent] = useState<LiveRecord[]>([]);
  const [searchResults, setSearchResults] = useState<LiveRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [totalCards, setTotalCards] = useState(0);
  const [authenticatedCards, setAuthenticatedCards] = useState(0);

  const isSearching = debouncedQuery.length > 0;

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query.trim()), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (typeof focusCardId === 'string' && focusCardId.length > 0) {
      router.push(databaseCardHref(focusCardId));
    }
  }, [focusCardId, router]);

  const loadCatalog = useCallback(async (isRefresh = false) => {
    const sport = activeSport;
    const trimmed = debouncedQuery.trim();

    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      if (trimmed) {
        const [searchResult, statsResult] = await Promise.all([
          listCatalogCards({ sport, query: trimmed, limit: SEARCH_PAGE_SIZE, sort: 'title_asc' }),
          getCatalogStats({ sport, query: trimmed })
        ]);

        setTotalCards(statsResult.stats.totalCards);
        setAuthenticatedCards(statsResult.stats.authenticatedCards);
        setSearchResults(
          searchResult.items.map((card) => cardToLiveRecord(card, databaseIcons.recordMantle))
        );
        setFeatured([]);
        setRecent([]);
        return;
      }

      const [featuredResult, recentResult, statsResult] = await Promise.all([
        listTrendingCards(4, sport),
        listRecentCards(8, sport),
        getCatalogStats({ sport })
      ]);

      const listError = featuredResult.error ?? recentResult.error ?? statsResult.error;
      setTotalCards(statsResult.stats.totalCards);
      setAuthenticatedCards(statsResult.stats.authenticatedCards);
      setSearchResults([]);
      setFeatured(
        featuredResult.items.map((card) => cardToLiveRecord(card, databaseIcons.recordMantle))
      );
      setRecent(
        recentResult.items.map((card) => cardToLiveRecord(card, databaseIcons.recentKobe))
      );
      if (listError && featuredResult.items.length === 0 && recentResult.items.length === 0) {
        console.warn('[database] catalog list failed:', listError);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [activeSport, debouncedQuery]);

  useEffect(() => {
    void loadCatalog();
  }, [loadCatalog]);

  const openSearch = (opts?: { sport?: DatabaseSportFilter; authenticated?: boolean }) => {
    router.push(
      databaseSearchHref({
        sport: opts?.sport ?? activeSport,
        authenticated: opts?.authenticated
      })
    );
  };

  const openCard = (cardId: string | undefined) => {
    if (cardId) router.push(databaseCardHref(cardId));
  };

  const renderRecordList = (
    records: LiveRecord[],
    variant: 'featured' | 'recent',
    emptyCopy: string
  ) => {
    if (records.length === 0) {
      return <Text style={styles.sectionEmpty}>{emptyCopy}</Text>;
    }

    return records.map((record) => (
      <DatabaseRecordCard
        key={record.key}
        cardImage={record.cardImage}
        imageUrl={record.imageUrl}
        title={record.title}
        description={record.description}
        tags={record.tags}
        meta={record.meta}
        variant={variant}
        s={s}
        t={t}
        onPress={record.cardId ? () => openCard(record.cardId) : undefined}
      />
    ));
  };

  return (
    <FigmaScreen
      backgroundColor={figmaColors.background}
      bottomNav={<FigmaDatabaseBottomNav active="database" />}
      scrollable={false}
    >
      <View style={styles.page}>
        <View style={[page.scrollContent, styles.fixedTop]}>
          <FigmaPageHeader
            title="DATABASE"
            subtitle="A HISTORY OF HISTORY."
            description="Browse authenticated cards, patch examples, provenance notes, and research evidence from across the hobby."
            heroSource={databaseIcons.hero}
            s={s}
            page={page}
          />

          <AppAnnouncementBanner />

          <View style={styles.stickyToolbar}>
            <View style={styles.searchRow}>
              <Ionicons name="search" size={s(20)} color={figmaColors.gray} />
              <TextInput
                style={styles.searchInput}
                value={query}
                onChangeText={setQuery}
                placeholder={databaseCopy.searchPlaceholder}
                placeholderTextColor={figmaColors.textMuted}
                returnKeyType="search"
                autoCorrect={false}
                autoCapitalize="none"
                accessibilityLabel="Search catalog"
              />
              {query.length > 0 ? (
                <Pressable onPress={() => setQuery('')} hitSlop={10} accessibilityLabel="Clear search">
                  <Ionicons name="close-circle" size={s(20)} color={figmaColors.gray} />
                </Pressable>
              ) : null}
              <Pressable onPress={() => router.push(databaseWishlistHref())} hitSlop={10}>
                <Ionicons name="heart-outline" size={s(22)} color={figmaColors.charcoal} />
              </Pressable>
            </View>

            <DatabaseChipRow
              label={databaseCopy.browseBySport}
              options={databaseSportTabs.map((key) => ({ key, label: key }))}
              value={activeSport}
              onChange={setActiveSport}
              s={s}
              t={t}
            />
          </View>
        </View>

        <ScrollView
          style={styles.cardScroll}
          contentContainerStyle={[page.scrollContent, styles.cardScrollContent]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => void loadCatalog(true)} />
          }
        >
          {!loading ? (
            <DatabaseStatsBar
              totalCards={totalCards}
              authenticatedCards={authenticatedCards}
              s={s}
              t={t}
            />
          ) : null}

          {loading ? (
            <View style={styles.sectionLoader}>
              <ActivityIndicator size="small" color={figmaColors.charcoal} />
              <Text style={styles.loadingText}>{databaseCopy.loadingCatalog}</Text>
            </View>
          ) : isSearching ? (
            <>
              <View style={page.sectionHeaderRow}>
                <Text style={page.sectionTitle}>{databaseCopy.searchResultsTitle}</Text>
                <Text style={page.viewAllText}>{databaseCopy.resultsCount(totalCards)}</Text>
              </View>
              {renderRecordList(searchResults, 'recent', databaseCopy.searchEmpty)}
            </>
          ) : (
            <>
              <View style={page.sectionHeaderRow}>
                <Text style={page.sectionTitle}>{databaseCopy.trending}</Text>
                <Pressable style={page.viewAllRow} onPress={() => openSearch({ authenticated: true })}>
                  <Text style={page.viewAllText}>{databaseCopy.viewAll}</Text>
                  <Image source={databaseIcons.sectionChevron} style={page.sectionChevron} resizeMode="contain" />
                </Pressable>
              </View>
              {renderRecordList(featured, 'featured', databaseCopy.featuredEmpty)}

              <View style={page.sectionHeaderRow}>
                <Text style={page.sectionTitle}>{databaseCopy.recentlyAdded}</Text>
                <Pressable style={page.viewAllRow} onPress={() => openSearch()}>
                  <Text style={page.viewAllText}>{databaseCopy.viewAll}</Text>
                  <Image source={databaseIcons.sectionChevron} style={page.sectionChevron} resizeMode="contain" />
                </Pressable>
              </View>
              {renderRecordList(recent, 'recent', databaseCopy.recentEmpty)}
            </>
          )}

          {!isSearching ? (
            <Pressable
              style={page.ctaCard}
              onPress={() => router.push('/education/education')}
              accessibilityRole="button"
            >
              <Image source={databaseIcons.ctaRecords} style={page.ctaIcon} resizeMode="contain" />
              <View style={page.ctaTextWrap}>
                <Text style={page.ctaTitle}>{databaseCopy.ctaObsessionTitle}</Text>
                <Text style={page.ctaBody}>{databaseCopy.ctaObsessionBody}</Text>
              </View>
              <Image source={databaseIcons.ctaArrow} style={page.ctaArrow} resizeMode="contain" />
            </Pressable>
          ) : null}
        </ScrollView>
      </View>
    </FigmaScreen>
  );
}

function createLocalStyles(s: (n: number) => number, t: (n: number) => number) {
  const tb = (n: number) => bodyText(t, n);

  return StyleSheet.create({
    page: { flex: 1 },
    fixedTop: {
      paddingBottom: 0
    },
    stickyToolbar: {
      backgroundColor: figmaColors.background,
      paddingBottom: s(8),
      zIndex: 2
    },
    searchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(10),
      borderWidth: 0.5,
      borderColor: figmaColors.borderLight,
      borderRadius: s(12),
      paddingHorizontal: s(20),
      backgroundColor: figmaColors.cream
    },
    searchInput: {
      flex: 1,
      paddingVertical: s(12),
      fontFamily: appFonts.body,
      fontSize: tb(18),
      color: figmaColors.charcoal
    },
    cardScroll: { flex: 1 },
    cardScrollContent: {
      paddingTop: s(8),
      paddingBottom: s(16)
    },
    sectionLoader: {
      paddingVertical: s(32),
      alignItems: 'center',
      gap: s(10),
      marginBottom: s(16)
    },
    loadingText: {
      fontFamily: appFonts.body,
      fontSize: tb(16),
      color: figmaColors.gray
    },
    sectionEmpty: {
      fontFamily: appFonts.body,
      fontSize: tb(17),
      lineHeight: tb(24),
      color: figmaColors.gray,
      marginBottom: s(16),
      paddingVertical: s(8)
    }
  });
}
