import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DatabaseRecordCard } from '@/components/figma/DatabaseRecordCard';
import { ProfileSubpageHeader } from '@/components/profile/ProfileSubpageHeader';
import {
  databaseFeaturedRecords,
  databaseIcons,
  databaseSportTabs,
  type DatabaseMetaItem
} from '@/constants/databaseContent';
import { databaseCopy } from '@/constants/databaseCopy';
import { figmaColors } from '@/constants/figmaColors';
import { databaseCardHref } from '@/constants/navigation';
import { useFigmaLayout } from '@/hooks/useFigmaLayout';
import {
  cardDescription,
  cardToTags,
  listCatalogCards,
  type CardSummary,
  type DatabaseSportFilter
} from '@/lib/cards';

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

export default function DatabaseSearchScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ q?: string; sport?: string; authenticated?: string }>();
  const { s, t } = useFigmaLayout(1);
  const styles = useMemo(() => createStyles(s, t), [s, t]);

  const initialSport = (params.sport?.toUpperCase() as DatabaseSportFilter) || 'ALL';
  const [query, setQuery] = useState(typeof params.q === 'string' ? params.q : '');
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  const [sport, setSport] = useState<DatabaseSportFilter>(
    databaseSportTabs.includes(initialSport as (typeof databaseSportTabs)[number])
      ? initialSport
      : 'ALL'
  );
  const [authenticatedOnly, setAuthenticatedOnly] = useState(params.authenticated === '1');
  const [results, setResults] = useState<CardSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    let active = true;
    setLoading(true);
    void listCatalogCards({
      query: debouncedQuery,
      sport,
      authenticatedOnly,
      limit: 40
    }).then(({ items, error: err }) => {
      if (!active) return;
      setResults(items);
      setError(err);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, [debouncedQuery, sport, authenticatedOnly]);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.content}>
        <ProfileSubpageHeader
          title={databaseCopy.searchTitle}
          s={s}
          t={t}
          onBack={() => router.back()}
        />

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

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabRow}>
          {databaseSportTabs.map((tab) => (
            <Pressable
              key={tab}
              style={[styles.tabButton, sport === tab && styles.tabButtonActive]}
              onPress={() => setSport(tab)}
            >
              <Text style={[styles.tabText, sport === tab && styles.tabTextActive]}>{tab}</Text>
            </Pressable>
          ))}
        </ScrollView>

        <Pressable
          style={[styles.filterChip, authenticatedOnly && styles.filterChipActive]}
          onPress={() => setAuthenticatedOnly((v) => !v)}
        >
          <Text style={[styles.filterChipText, authenticatedOnly && styles.filterChipTextActive]}>
            Authenticated only
          </Text>
        </Pressable>

        {loading ? <ActivityIndicator style={styles.loader} color={figmaColors.charcoal} /> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}

        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            !loading ? (
              <Text style={styles.empty}>
                {debouncedQuery.trim()
                  ? 'No matching cards in the catalog.'
                  : databaseCopy.recentEmpty}
              </Text>
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
      </View>
    </SafeAreaView>
  );
}

function createStyles(s: (n: number) => number, t: (n: number) => number) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: figmaColors.background },
    content: { flex: 1, paddingHorizontal: s(16) },
    input: {
      marginBottom: s(12),
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      borderRadius: s(10),
      paddingHorizontal: s(14),
      paddingVertical: s(12),
      fontFamily: 'Inter_400Regular',
      fontSize: t(16),
      color: figmaColors.charcoal,
      backgroundColor: figmaColors.cream
    },
    tabRow: { gap: s(10), paddingBottom: s(10) },
    tabButton: {
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      borderRadius: s(20),
      paddingHorizontal: s(14),
      paddingVertical: s(8),
      backgroundColor: figmaColors.cream
    },
    tabButtonActive: {
      backgroundColor: figmaColors.charcoal,
      borderColor: figmaColors.charcoal
    },
    tabText: {
      fontFamily: 'Inter_700Bold',
      fontSize: t(11),
      color: figmaColors.gray
    },
    tabTextActive: { color: figmaColors.cream },
    filterChip: {
      alignSelf: 'flex-start',
      borderWidth: 1,
      borderColor: figmaColors.tagBorder,
      borderRadius: s(20),
      paddingHorizontal: s(14),
      paddingVertical: s(8),
      marginBottom: s(12),
      backgroundColor: figmaColors.tagBg
    },
    filterChipActive: {
      backgroundColor: figmaColors.charcoal,
      borderColor: figmaColors.charcoal
    },
    filterChipText: {
      fontFamily: 'Inter_700Bold',
      fontSize: t(11),
      color: figmaColors.gray
    },
    filterChipTextActive: { color: figmaColors.cream },
    loader: { marginVertical: s(12) },
    error: {
      marginBottom: s(8),
      fontFamily: 'EBGaramond_400Regular',
      fontSize: t(14),
      color: figmaColors.error,
      textAlign: 'center'
    },
    list: { paddingBottom: s(24) },
    empty: {
      fontFamily: 'EBGaramond_400Regular',
      fontSize: t(16),
      color: figmaColors.gray,
      textAlign: 'center',
      marginTop: s(24)
    }
  });
}
