import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ProfileSubpageHeader } from '@/components/profile/ProfileSubpageHeader';
import {
  MostWantedEmptyState,
  MostWantedLoadingState
} from '@/components/most-wanted/MostWantedShared';
import { WantedCard } from '@/components/most-wanted/WantedCard';
import { mostWantedCopy } from '@/constants/mostWantedCopy';
import { mostWantedDetailHref, mostWantedSubmitHref } from '@/constants/navigation';
import { figmaColors } from '@/constants/figmaColors';
import { appFonts } from '@/constants/appFonts';
import { useFigmaLayout } from '@/hooks/useFigmaLayout';
import { useMostWantedRealtime } from '@/hooks/useMostWantedRealtime';
import { listWatchedHunts, type MostWantedHuntRow } from '@/lib/most-wanted';

export default function MostWantedWatchedScreen() {
  const router = useRouter();
  const { s, t } = useFigmaLayout();
  const styles = useMemo(() => createStyles(s, t), [s, t]);
  const [items, setItems] = useState<MostWantedHuntRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const { items: rows, error: err } = await listWatchedHunts();
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
          title={mostWantedCopy.watchedTitle}
          subtitle={mostWantedCopy.watchedSubtitle}
          description="Track progress on hunts you care about and jump back in when new evidence appears."
          s={s}
          t={t}
          onBack={() => router.back()}
        />

        {loading ? <MostWantedLoadingState message="Loading watch list…" s={s} t={t} /> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}

        {!loading && !error && items.length === 0 ? (
          <MostWantedEmptyState
            title={mostWantedCopy.emptyWatchedTitle}
            body={mostWantedCopy.emptyWatchedBody}
            icon="eye-outline"
            s={s}
            t={t}
          />
        ) : null}

        {items.map((hunt) => (
          <WantedCard
            key={hunt.id}
            hunt={hunt}
            compact
            s={s}
            t={t}
            onPress={() => router.push(mostWantedDetailHref(hunt.id))}
            onContribute={() => router.push(mostWantedSubmitHref(hunt.id))}
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
