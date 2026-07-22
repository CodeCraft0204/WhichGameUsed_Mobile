import { useFocusEffect } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ProfileSubpageHeader } from '@/components/profile/ProfileSubpageHeader';
import { BountyRankingCard } from '@/components/most-wanted/BountyRankingCard';
import {
  MostWantedEmptyState,
  MostWantedLoadingState
} from '@/components/most-wanted/MostWantedShared';
import { mostWantedCopy } from '@/constants/mostWantedCopy';
import { figmaColors } from '@/constants/figmaColors';
import { appFonts } from '@/constants/appFonts';
import { useFigmaLayout } from '@/hooks/useFigmaLayout';
import { mostWantedHref, safeGoBack } from '@/constants/navigation';
import { listBountyRankings, toggleDemandVote, type BountyRankingRow } from '@/lib/most-wanted';

export default function MostWantedRankingsScreen() {
  const { s, t } = useFigmaLayout();
  const styles = useMemo(() => createStyles(s, t), [s, t]);
  const [items, setItems] = useState<BountyRankingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const { items: rows, error: err } = await listBountyRankings(25);
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

  const handleVote = useCallback(async (row: BountyRankingRow, action: 'upvote' | 'downvote') => {
    const key = row.card_request_id ?? row.card_id;
    const { voteScore, userVote, error: voteError } = await toggleDemandVote(row, action);
    if (voteError) {
      setError(voteError);
      return;
    }
    setItems((prev) =>
      prev.map((item) =>
        (item.card_request_id ?? item.card_id) === key
          ? { ...item, vote_score: voteScore, user_vote: userVote }
          : item
      )
    );
  }, []);

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
          title={mostWantedCopy.rankingsPageTitle}
          subtitle={mostWantedCopy.rankingsPageSubtitle}
          description="Help decide which mystery cards the community should research next."
          s={s}
          t={t}
          onBack={() => safeGoBack(mostWantedHref())}
        />

        {loading ? <MostWantedLoadingState message="Loading rankings…" s={s} t={t} /> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}

        {!loading && !error && items.length === 0 ? (
          <MostWantedEmptyState
            title={mostWantedCopy.emptyRankingsTitle}
            body={mostWantedCopy.emptyRankingsBody}
            icon="podium-outline"
            s={s}
            t={t}
          />
        ) : null}

        {items.map((row, index) => (
          <BountyRankingCard
            key={row.card_request_id ?? row.card_id ?? `${row.card_title}-${index}`}
            row={row}
            rank={index + 1}
            s={s}
            t={t}
            onVote={(action) => void handleVote(row, action)}
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
      color: figmaColors.error,
      marginBottom: s(12)
    }
  });
}
