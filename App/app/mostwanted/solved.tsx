import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ProfileSubpageHeader } from '@/components/profile/ProfileSubpageHeader';
import {
  MostWantedEmptyState,
  MostWantedLoadingState
} from '@/components/most-wanted/MostWantedShared';
import { SolvedHuntCard } from '@/components/most-wanted/SolvedHuntCard';
import { mostWantedCopy } from '@/constants/mostWantedCopy';
import { mostWantedDetailHref, databaseCardHref } from '@/constants/navigation';
import { figmaColors } from '@/constants/figmaColors';
import { appFonts } from '@/constants/appFonts';
import { useFigmaLayout } from '@/hooks/useFigmaLayout';
import { useMostWantedRealtime } from '@/hooks/useMostWantedRealtime';
import { listSolvedHunts, type SolvedHuntRow } from '@/lib/most-wanted';

export default function MostWantedSolvedScreen() {
  const router = useRouter();
  const { s, t } = useFigmaLayout();
  const styles = useMemo(() => createStyles(s, t), [s, t]);
  const [items, setItems] = useState<SolvedHuntRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const { items: rows, error: err } = await listSolvedHunts();
    setItems(rows);
    setError(err);
    setLoading(false);
    setRefreshing(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  useMostWantedRealtime(() => void load(), true);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              void load();
            }}
            tintColor={figmaColors.charcoal}
          />
        }
      >
        <ProfileSubpageHeader
          title={mostWantedCopy.solvedTitle}
          subtitle={mostWantedCopy.solvedSubtitle}
          description="Completed hunts archived by the community — solver, date, and reward status."
          s={s}
          t={t}
          onBack={() => router.back()}
        />

        {loading ? <MostWantedLoadingState message="Loading solved hunts…" s={s} t={t} /> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}

        {!loading && !error && items.length === 0 ? (
          <MostWantedEmptyState
            title={mostWantedCopy.emptySolvedTitle}
            body={mostWantedCopy.emptySolvedBody}
            icon="trophy-outline"
            s={s}
            t={t}
          />
        ) : null}

        {items.map((hunt) => (
          <SolvedHuntCard
            key={hunt.id}
            hunt={hunt}
            s={s}
            t={t}
            onPress={() => router.push(mostWantedDetailHref(hunt.id))}
            onViewCatalog={
              hunt.card_id
                ? () => router.push(databaseCardHref(hunt.card_id!))
                : undefined
            }
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(s: (n: number) => number, t: (n: number) => number) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: figmaColors.background },
    content: { paddingHorizontal: s(20), paddingBottom: s(32) },
    error: {
      fontFamily: appFonts.body,
      fontSize: t(14),
      color: figmaColors.error
    }
  });
}
