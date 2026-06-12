import { Ionicons } from '@expo/vector-icons';

import { useFocusEffect, useRouter } from 'expo-router';

import React, { useCallback, useMemo, useState } from 'react';

import {
  ActivityIndicator,
  Image,
  Pressable,
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

  const [loading, setLoading] = useState(true);

  const [totalCards, setTotalCards] = useState(0);

  const [authenticatedCards, setAuthenticatedCards] = useState(0);



  const loadCards = useCallback((sport: DatabaseSportFilter) => {

    setLoading(true);

    void Promise.all([

      listCatalogCards({ sport, authenticatedOnly: true, limit: 4, sort: 'auth_desc' }),

      listCatalogCards({ sport, limit: 8, sort: 'year_desc' }),

      getCatalogStats({ sport })

    ])

      .then(([featuredResult, recentResult, statsResult]) => {

        setTotalCards(statsResult.stats.totalCards);

        setAuthenticatedCards(statsResult.stats.authenticatedCards);

        setFeatured(

          featuredResult.items.map((card) =>

            cardToLiveRecord(card, databaseIcons.recordMantle)

          )

        );

        setRecent(

          recentResult.items.map((card) =>

            cardToLiveRecord(card, databaseIcons.recentKobe)

          )

        );

      })

      .finally(() => setLoading(false));

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



          <View style={styles.stickyToolbar}>

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

        </View>



        <ScrollView

          style={styles.cardScroll}

          contentContainerStyle={[page.scrollContent, styles.cardScrollContent]}

          showsVerticalScrollIndicator={false}

          keyboardShouldPersistTaps="handled"

        >

          {!loading ? (

            <DatabaseStatsBar

              totalCards={totalCards}

              authenticatedCards={authenticatedCards}

              s={s}

              t={t}

            />

          ) : null}



          <View style={page.sectionHeaderRow}>

            <Text style={page.sectionTitle}>{databaseCopy.featuredRecords}</Text>

            <Pressable style={page.viewAllRow} onPress={() => openSearch({ authenticated: true })}>

              <Text style={page.viewAllText}>{databaseCopy.viewAll}</Text>

              <Image source={databaseIcons.sectionChevron} style={page.sectionChevron} resizeMode="contain" />

            </Pressable>

          </View>



          {loading ? (

            <View style={styles.sectionLoader}>

              <ActivityIndicator size="small" color={figmaColors.charcoal} />

              <Text style={styles.loadingText}>{databaseCopy.loadingCatalog}</Text>

            </View>

          ) : (

            <>

              {featured.length === 0 ? (

                <Text style={styles.sectionEmpty}>{databaseCopy.featuredEmpty}</Text>

              ) : (

                featured.map((record) => (

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

                ))

              )}



              <View style={page.sectionHeaderRow}>

                <Text style={page.sectionTitle}>{databaseCopy.recentlyAdded}</Text>

                <Pressable style={page.viewAllRow} onPress={() => openSearch()}>

                  <Text style={page.viewAllText}>{databaseCopy.viewAll}</Text>

                  <Image source={databaseIcons.sectionChevron} style={page.sectionChevron} resizeMode="contain" />

                </Pressable>

              </View>



              {recent.length === 0 ? (

                <Text style={styles.sectionEmpty}>{databaseCopy.recentEmpty}</Text>

              ) : (

                recent.map((record) => (

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

                ))

              )}

            </>

          )}



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


