import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { DatabaseRecordCard } from '@/components/figma/DatabaseRecordCard';
import { FigmaDatabaseBottomNav } from '@/components/figma/FigmaDatabaseBottomNav';
import { createFigmaPageStyles } from '@/components/figma/figmaPageStyles';
import { FigmaScreen } from '@/components/figma/FigmaScreen';
import { FigmaUtilityBar } from '@/components/figma/FigmaUtilityBar';
import {
  databaseFeaturedRecords,
  databaseIcons,
  databaseRecentRecords,
  databaseSportTabs,
  type DatabaseMetaItem,
  type DatabaseRecord
} from '@/constants/databaseContent';
import { databaseCopy } from '@/constants/databaseCopy';
import { figmaColors } from '@/constants/figmaColors';
import { figmaSharedIcons } from '@/constants/figmaShared';
import { databaseCardHref, databaseSearchHref } from '@/constants/navigation';
import { useFigmaLayout } from '@/hooks/useFigmaLayout';
import {
  cardDescription,
  cardToTags,
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
  const styles = useMemo(() => createLocalStyles(s), [s]);

  const [activeSport, setActiveSport] = useState<DatabaseSportFilter>('ALL');
  const [featured, setFeatured] = useState<LiveRecord[]>([]);
  const [recent, setRecent] = useState<LiveRecord[]>([]);
  const [usingLiveData, setUsingLiveData] = useState(false);

  const loadCards = useCallback((sport: DatabaseSportFilter) => {
    void Promise.all([
      listCatalogCards({ sport, authenticatedOnly: true, limit: 4 }),
      listCatalogCards({ sport, limit: 8 })
    ]).then(([featuredResult, recentResult]) => {
      const hasLive = featuredResult.items.length > 0 || recentResult.items.length > 0;
      setUsingLiveData(hasLive);

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
      scrollProps={{ contentContainerStyle: page.scrollContent }}
    >
      <View style={[page.headerSection, styles.headerSection]}>
        <Text style={page.title}>DATABASE</Text>
        <Image source={figmaSharedIcons.titleBrush} style={page.titleBrush} resizeMode="stretch" />
        <Text style={page.subtitle}>A HISTORY OF HISTORY.</Text>
        <Text style={page.description}>
          Browse authenticated cards, patch examples, provenance notes, and research evidence from across
          the hobby.
        </Text>
        <Image source={databaseIcons.hero} style={styles.heroImage} resizeMode="contain" />
        <FigmaUtilityBar s={s} />

        <Pressable onPress={() => openSearch()} accessibilityRole="search">
          <TextInput
            style={styles.searchInput}
            placeholder={databaseCopy.searchPlaceholder}
            placeholderTextColor={figmaColors.textMuted}
            editable={false}
            pointerEvents="none"
          />
        </Pressable>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={page.tabRow}>
          {databaseSportTabs.map((tab) => (
            <Pressable
              key={tab}
              style={[page.tabButton, activeSport === tab && page.tabButtonActive]}
              onPress={() => setActiveSport(tab)}
            >
              <Text style={[page.tabText, activeSport === tab && page.tabTextActive]}>{tab}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <View style={page.sectionHeaderRow}>
        <Text style={page.sectionTitle}>FEATURED RECORDS</Text>
        <Pressable style={page.viewAllRow} onPress={() => openSearch({ authenticated: true })}>
          <Text style={styles.viewAllText}>{databaseCopy.viewAll}</Text>
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
        <Text style={page.sectionTitle}>RECENTLY ADDED</Text>
        <Pressable style={page.viewAllRow} onPress={() => openSearch()}>
          <Text style={styles.viewAllText}>{databaseCopy.viewAll}</Text>
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
          variant="featured"
          s={s}
          t={t}
          onPress={record.cardId ? () => openCard(record.cardId) : undefined}
        />
      ))}

      <View style={styles.ctaCard}>
        <Image source={databaseIcons.ctaRecords} style={page.ctaIcon} resizeMode="contain" />
        <View style={page.ctaTextWrap}>
          <Text style={styles.ctaTitle}>AUTHENTICATION TAKES OBSESSION.</Text>
          <Text style={styles.ctaBody}>
            Learn how to authenticate game-used cards, contribute to the conversation, and win monthly
            prizes.
          </Text>
        </View>
        <Image source={databaseIcons.ctaArrow} style={page.ctaArrow} resizeMode="contain" />
      </View>
    </FigmaScreen>
  );
}

function createLocalStyles(s: (n: number) => number) {
  return StyleSheet.create({
    headerSection: {
      minHeight: s(420)
    },
    heroImage: {
      position: 'absolute',
      right: s(100),
      top: s(28),
      width: s(329),
      height: s(300)
    },
    searchInput: {
      marginTop: s(8),
      marginBottom: s(4),
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      borderRadius: s(10),
      paddingHorizontal: s(14),
      paddingVertical: s(12),
      fontFamily: 'Inter_400Regular',
      fontSize: 15,
      color: figmaColors.charcoal,
      backgroundColor: figmaColors.cream
    },
    viewAllText: {
      fontFamily: 'EBGaramond_700Bold',
      fontSize: 15,
      color: figmaColors.gray
    },
    sectionEmpty: {
      fontFamily: 'EBGaramond_400Regular',
      fontSize: 16,
      color: figmaColors.gray,
      marginBottom: s(12)
    },
    ctaCard: {
      minHeight: s(108),
      borderRadius: s(12),
      backgroundColor: figmaColors.ctaBackground,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: s(12),
      marginTop: s(8)
    },
    ctaTitle: {
      fontFamily: 'PermanentMarker_400Regular',
      fontSize: 17,
      color: figmaColors.charcoal,
      marginBottom: s(4)
    },
    ctaBody: {
      fontFamily: 'EBGaramond_700Bold',
      fontSize: 18,
      lineHeight: 20,
      color: figmaColors.gray
    }
  });
}
