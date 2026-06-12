import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { DatabaseChipRow } from '@/components/database/DatabaseChipRow';
import { DatabaseStatsBar } from '@/components/database/DatabaseStatsBar';
import { DatabaseRecordCard } from '@/components/figma/DatabaseRecordCard';
import { FigmaDatabaseBottomNav } from '@/components/figma/FigmaDatabaseBottomNav';
import { createFigmaPageStyles } from '@/components/figma/figmaPageStyles';
import { FigmaScreen } from '@/components/figma/FigmaScreen';
import { FigmaUtilityBar } from '@/components/figma/FigmaUtilityBar';
import {
  databaseFeaturedRecords,
  databaseIcons,
  databaseRecentRecords,
  type DatabaseMetaItem,
  type DatabaseRecord
} from '@/constants/databaseContent';
import { appFonts } from '@/constants/appFonts';
import { bodyText } from '@/constants/appTypography';
import { databaseCopy } from '@/constants/databaseCopy';
import { databaseSportTabs } from '@/constants/databaseFilters';
import { figmaColors } from '@/constants/figmaColors';
import { figmaSharedIcons } from '@/constants/figmaShared';
import { databaseCardHref, databaseSearchHref, databaseWishlistHref } from '@/constants/navigation';
import { useFigmaLayout } from '@/hooks/useFigmaLayout';
import {
  cardDescription,
  cardToTags,
  getCatalogStats,
  listCatalogCards,
  type CardSummary,
  type DatabaseSportFilter
} from '@/lib/cards';

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
  const { s, t } = useFigmaLayout();
  const page = useMemo(() => createFigmaPageStyles(s, t), [s, t]);
  const styles = useMemo(() => createLocalStyles(s, t), [s, t]);

  const [activeSport, setActiveSport] = useState<DatabaseSportFilter>('ALL');
  const [featured, setFeatured] = useState<LiveRecord[]>([]);
  const [recent, setRecent] = useState<LiveRecord[]>([]);
  const [usingLiveData, setUsingLiveData] = useState(false);
  const [totalCards, setTotalCards] = useState(0);
  const [authenticatedCards, setAuthenticatedCards] = useState(0);

  const loadCards = useCallback((sport: DatabaseSportFilter) => {
    void Promise.all([
      listCatalogCards({ sport, authenticatedOnly: true, limit: 4, sort: 'auth_desc' }),
      listCatalogCards({ sport, limit: 8, sort: 'year_desc' }),
      getCatalogStats({ sport })
    ]).then(([featuredResult, recentResult, statsResult]) => {
      const hasLive = featuredResult.items.length > 0 || recentResult.items.length > 0;
      setUsingLiveData(hasLive);
      setTotalCards(statsResult.stats.totalCards);
      setAuthenticatedCards(statsResult.stats.authenticatedCards);

      if (featuredResult.items.length > 0) {
        setFeatured(
          featuredResult.items.map((card, i) =>
            cardToLiveRecord(
              card,
              databaseFeaturedRecords[i % databaseFeaturedRecords.length]?.cardImage ??
                databaseIcons.recordMantle
            )
          )
        );
      } else if (!hasLive) {
        setFeatured(databaseFeaturedRecords);
      } else {
        setFeatured([]);
      }

      if (recentResult.items.length > 0) {
        setRecent(
          recentResult.items.map((card, i) =>
            cardToLiveRecord(
              card,
              databaseRecentRecords[i % databaseRecentRecords.length]?.cardImage ?? databaseIcons.recentKobe
            )
          )
        );
      } else if (!hasLive) {
        setRecent(databaseRecentRecords);
      } else {
        setRecent([]);
      }
    });
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadCards(activeSport);
    }, [activeSport, loadCards])
  );

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

  return (
    <FigmaScreen
      backgroundColor={figmaColors.background}
      bottomNav={<FigmaDatabaseBottomNav active="database" />}
      scrollProps={{ contentContainerStyle: page.scrollContent, keyboardShouldPersistTaps: 'handled' }}
    >
      <View style={page.headerSection}>
        <Text style={page.title}>DATABASE</Text>
        <Image source={figmaSharedIcons.titleBrush} style={page.titleBrush} resizeMode="stretch" />

        <Text style={[page.subtitle, styles.subtitle]}>A HISTORY OF HISTORY.</Text>
        <Text style={[page.description, styles.description]}>
          Browse authenticated cards, patch examples, provenance notes, and research evidence from across
          the hobby.
        </Text>

        <Image source={databaseIcons.hero} style={styles.heroImage} resizeMode="contain" />
        <FigmaUtilityBar s={s} />

        <Pressable onPress={() => openSearch()} accessibilityRole="search" style={styles.searchRow}>
          <Ionicons name="search" size={s(20)} color={figmaColors.gray} />
          <TextInput
            style={styles.searchInput}
            placeholder={databaseCopy.searchPlaceholder}
            placeholderTextColor={figmaColors.textMuted}
            editable={false}
            pointerEvents="none"
          />
          <Pressable onPress={() => router.push(databaseWishlistHref())} hitSlop={10}>
            <Ionicons name="heart-outline" size={s(22)} color={figmaColors.charcoal} />
          </Pressable>
        </Pressable>

        <DatabaseChipRow
          label={databaseCopy.browseBySport}
          options={databaseSportTabs.map((key) => ({ key, label: key }))}
          value={activeSport}
          onChange={setActiveSport}
          s={s}
          t={t}
        />
      </View>

      {(usingLiveData || totalCards > 0) && (
        <DatabaseStatsBar
          totalCards={totalCards}
          authenticatedCards={authenticatedCards}
          s={s}
          t={t}
        />
      )}

      <View style={page.sectionHeaderRow}>
        <Text style={page.sectionTitle}>{databaseCopy.featuredRecords}</Text>
        <Pressable style={page.viewAllRow} onPress={() => openSearch({ authenticated: true })}>
          <Text style={page.viewAllText}>{databaseCopy.viewAll}</Text>
          <Image source={databaseIcons.sectionChevron} style={page.sectionChevron} resizeMode="contain" />
        </Pressable>
      </View>

      {featured.length === 0 && usingLiveData ? (
        <Text style={styles.sectionEmpty}>{databaseCopy.featuredEmpty}</Text>
      ) : null}

      {featured.map((record) => (
        <DatabaseRecordCard
          key={record.key}
          cardImage={record.cardImage}
          imageUrl={record.imageUrl}
          title={record.title}
          description={record.description}
          tags={record.tags}
          meta={record.meta}
          variant="featured"
          s={s}
          t={t}
          onPress={record.cardId ? () => openCard(record.cardId) : undefined}
        />
      ))}

      <View style={page.sectionHeaderRow}>
        <Text style={page.sectionTitle}>{databaseCopy.recentlyAdded}</Text>
        <Pressable style={page.viewAllRow} onPress={() => openSearch()}>
          <Text style={page.viewAllText}>{databaseCopy.viewAll}</Text>
          <Image source={databaseIcons.sectionChevron} style={page.sectionChevron} resizeMode="contain" />
        </Pressable>
      </View>

      {recent.length === 0 && usingLiveData ? (
        <Text style={styles.sectionEmpty}>{databaseCopy.recentEmpty}</Text>
      ) : null}

      {recent.map((record) => (
        <DatabaseRecordCard
          key={record.key}
          cardImage={record.cardImage}
          imageUrl={record.imageUrl}
          title={record.title}
          description={record.description}
          tags={record.tags}
          meta={record.meta}
          variant="recent"
          s={s}
          t={t}
          onPress={record.cardId ? () => openCard(record.cardId) : undefined}
        />
      ))}

      <Pressable style={styles.browseCta} onPress={() => openSearch()}>
        <Text style={styles.browseCtaText}>Open full catalog search</Text>
        <Ionicons name="arrow-forward" size={s(18)} color={figmaColors.cream} />
      </Pressable>
    </FigmaScreen>
  );
}

function createLocalStyles(s: (n: number) => number, t: (n: number) => number) {
  const tb = (n: number) => bodyText(t, n);

  return StyleSheet.create({
    subtitle: { marginTop: s(20) },
    description: { marginTop: s(16) },
    heroImage: {
      position: 'absolute',
      right: s(90),
      top: s(32),
      width: s(300),
      height: s(320),
      zIndex: 0,
      pointerEvents: 'none'
    },
    searchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(10),
      marginTop: s(12),
      marginBottom: s(4),
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      borderRadius: s(12),
      paddingHorizontal: s(14),
      paddingVertical: s(4),
      backgroundColor: figmaColors.cream,
      zIndex: 2
    },
    searchInput: {
      flex: 1,
      paddingVertical: s(12),
      fontFamily: appFonts.body,
      fontSize: tb(18),
      color: figmaColors.charcoal
    },
    sectionEmpty: {
      fontFamily: appFonts.body,
      fontSize: tb(18),
      lineHeight: tb(26),
      color: figmaColors.gray,
      marginBottom: s(12)
    },
    browseCta: {
      marginTop: s(12),
      marginBottom: s(8),
      minHeight: s(52),
      borderRadius: s(12),
      backgroundColor: figmaColors.charcoal,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: s(8),
      paddingHorizontal: s(16)
    },
    browseCtaText: {
      fontFamily: appFonts.body,
      fontSize: tb(18),
      color: figmaColors.cream
    }
  });
}
