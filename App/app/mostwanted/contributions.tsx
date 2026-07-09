import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ProfileSubpageHeader } from '@/components/profile/ProfileSubpageHeader';
import { mostWantedCopy } from '@/constants/mostWantedCopy';
import { mostWantedDetailHref, mostWantedSubmitHref } from '@/constants/navigation';
import { figmaColors } from '@/constants/figmaColors';
import { appFonts } from '@/constants/appFonts';
import { useFigmaLayout } from '@/hooks/useFigmaLayout';
import { useMostWantedRealtime } from '@/hooks/useMostWantedRealtime';
import {
  evidenceTypeLabel,
  listMyMostWantedContributions,
  relativeTime,
  type MostWantedContribution
} from '@/lib/most-wanted';

const STATUS_ORDER = ['pending_review', 'approved', 'needs_more_info', 'rejected'] as const;

export default function MostWantedContributionsScreen() {
  const router = useRouter();
  const { s, t } = useFigmaLayout();
  const styles = useMemo(() => createStyles(s, t), [s, t]);
  const [items, setItems] = useState<MostWantedContribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    const { items: rows, error: err } = await listMyMostWantedContributions();
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

  const grouped = useMemo(() => {
    const map = new Map<string, MostWantedContribution[]>();
    for (const status of STATUS_ORDER) map.set(status, []);
    for (const item of items) {
      const bucket = map.get(item.status) ?? [];
      bucket.push(item);
      map.set(item.status, bucket);
    }
    return map;
  }, [items]);

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
          title={mostWantedCopy.contributionsTitle}
          subtitle={mostWantedCopy.contributionsSubtitle}
          s={s}
          t={t}
          onBack={() => router.back()}
        />

        {loading ? <ActivityIndicator color={figmaColors.charcoal} /> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}

        {!loading && !error && items.length === 0 ? (
          <Text style={styles.muted}>You have not submitted evidence yet.</Text>
        ) : null}

        {STATUS_ORDER.map((status) => {
          const rows = grouped.get(status) ?? [];
          if (rows.length === 0) return null;
          return (
            <View key={status} style={styles.section}>
              <Text style={styles.sectionTitle}>
                {mostWantedCopy.contributionSections[status]}
              </Text>
              {rows.map((row) => (
                <View key={row.id} style={styles.row}>
                  <Text
                    style={styles.rowTitle}
                    onPress={() => router.push(mostWantedDetailHref(row.hunt_id))}
                  >
                    {row.hunt_title}
                  </Text>
                  <Text style={styles.rowMeta}>Evidence Type: {evidenceTypeLabel(row.evidence_type)}</Text>
                  <Text style={styles.rowMeta}>
                    Status: {mostWantedCopy.contributionSections[row.status as keyof typeof mostWantedCopy.contributionSections] ?? row.status}
                  </Text>
                  <Text style={styles.rowMeta}>Submitted: {relativeTime(row.created_at)}</Text>
                  {row.review_notes ? (
                    <Text style={styles.reviewNotes}>Reviewer: {row.review_notes}</Text>
                  ) : null}
                  {row.status === 'needs_more_info' ? (
                    <Pressable
                      onPress={() =>
                        router.push(
                          mostWantedSubmitHref(row.hunt_id, {
                            evidenceType: row.evidence_type,
                            notes: row.review_notes ?? undefined
                          })
                        )
                      }
                    >
                      <Text style={styles.resubmit}>Update submission</Text>
                    </Pressable>
                  ) : null}
                </View>
              ))}
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(s: (n: number) => number, t: (n: number) => number) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: figmaColors.background },
    content: { paddingHorizontal: s(20), paddingBottom: s(32) },
    section: { marginBottom: s(18) },
    sectionTitle: {
      fontFamily: appFonts.accent,
      fontSize: t(16),
      color: figmaColors.charcoal,
      marginBottom: s(8)
    },
    row: {
      backgroundColor: figmaColors.cream,
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      borderRadius: s(10),
      padding: s(12),
      marginBottom: s(8),
      gap: s(4)
    },
    rowTitle: {
      fontFamily: appFonts.body,
      fontSize: t(15),
      color: figmaColors.accent
    },
    rowMeta: {
      fontFamily: appFonts.body,
      fontSize: t(13),
      color: figmaColors.gray
    },
    reviewNotes: {
      fontFamily: appFonts.body,
      fontSize: t(12),
      color: figmaColors.charcoal,
      marginTop: s(4)
    },
    resubmit: {
      fontFamily: appFonts.body,
      fontSize: t(13),
      color: figmaColors.accent,
      marginTop: s(6)
    },
    muted: {
      fontFamily: appFonts.body,
      fontSize: t(14),
      color: figmaColors.gray
    },
    error: {
      fontFamily: appFonts.body,
      fontSize: t(14),
      color: figmaColors.accent
    }
  });
}
