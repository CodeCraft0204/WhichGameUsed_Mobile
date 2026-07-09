import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ProfileSubpageHeader } from '@/components/profile/ProfileSubpageHeader';
import {
  MostWantedEmptyState,
  MostWantedLoadingState,
  MostWantedStatusBadge
} from '@/components/most-wanted/MostWantedShared';
import { mostWantedCopy } from '@/constants/mostWantedCopy';
import type { MwContributionStatus } from '@/constants/mostWantedStyles';
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

const STATUS_ORDER: MwContributionStatus[] = ['pending_review', 'approved', 'needs_more_info', 'rejected'];

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
    const map = new Map<MwContributionStatus, MostWantedContribution[]>();
    for (const status of STATUS_ORDER) map.set(status, []);
    for (const item of items) {
      const status = item.status as MwContributionStatus;
      const bucket = map.get(status) ?? [];
      bucket.push(item);
      map.set(status, bucket);
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
          description="Evidence you submit is reviewed by admins before it counts toward hunt progress."
          s={s}
          t={t}
          onBack={() => router.back()}
        />

        {loading ? <MostWantedLoadingState message="Loading contributions…" s={s} t={t} /> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}

        {!loading && !error && items.length === 0 ? (
          <MostWantedEmptyState
            title={mostWantedCopy.emptyContributionsTitle}
            body={mostWantedCopy.emptyContributionsBody}
            icon="document-text-outline"
            s={s}
            t={t}
          />
        ) : null}

        {STATUS_ORDER.map((status) => {
          const rows = grouped.get(status) ?? [];
          if (rows.length === 0) return null;
          const sectionLabel = mostWantedCopy.contributionSections[status];
          return (
            <View key={status} style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{sectionLabel}</Text>
                <Text style={styles.sectionCount}>{rows.length}</Text>
              </View>
              {rows.map((row) => (
                <View key={row.id} style={styles.card}>
                  <View style={styles.cardTop}>
                    <Pressable
                      onPress={() => router.push(mostWantedDetailHref(row.hunt_id))}
                      style={styles.titlePress}
                    >
                      <Text style={styles.rowTitle} numberOfLines={2}>
                        {row.hunt_title}
                      </Text>
                    </Pressable>
                    <MostWantedStatusBadge status={status} label={sectionLabel} s={s} t={t} />
                  </View>

                  <View style={styles.metaRow}>
                    <Ionicons name="layers-outline" size={s(14)} color={figmaColors.gray} />
                    <Text style={styles.rowMeta}>{evidenceTypeLabel(row.evidence_type)}</Text>
                  </View>
                  <View style={styles.metaRow}>
                    <Ionicons name="time-outline" size={s(14)} color={figmaColors.gray} />
                    <Text style={styles.rowMeta}>Submitted {relativeTime(row.created_at)}</Text>
                  </View>

                  {row.review_notes ? (
                    <View style={styles.reviewBox}>
                      <Text style={styles.reviewLabel}>Reviewer notes</Text>
                      <Text style={styles.reviewNotes}>{row.review_notes}</Text>
                    </View>
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
                      style={styles.resubmitBtn}
                    >
                      <Text style={styles.resubmit}>Update submission</Text>
                      <Ionicons name="arrow-forward" size={s(14)} color={figmaColors.accent} />
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
    section: { marginBottom: s(20) },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: s(10)
    },
    sectionTitle: {
      fontFamily: appFonts.display,
      fontSize: t(18),
      color: figmaColors.charcoal
    },
    sectionCount: {
      fontFamily: appFonts.bodyBold,
      fontSize: t(13),
      color: figmaColors.gray
    },
    card: {
      backgroundColor: figmaColors.cream,
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      borderRadius: s(12),
      padding: s(14),
      marginBottom: s(10),
      gap: s(8)
    },
    cardTop: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      gap: s(10)
    },
    titlePress: { flex: 1 },
    rowTitle: {
      fontFamily: appFonts.bodyBold,
      fontSize: t(15),
      lineHeight: t(20),
      color: figmaColors.charcoal
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(6)
    },
    rowMeta: {
      fontFamily: appFonts.body,
      fontSize: t(13),
      color: figmaColors.gray
    },
    reviewBox: {
      backgroundColor: figmaColors.surfaceHighlight,
      borderRadius: s(8),
      padding: s(10),
      gap: s(4)
    },
    reviewLabel: {
      fontFamily: appFonts.accent,
      fontSize: t(9),
      letterSpacing: 0.5,
      color: figmaColors.gray,
      textTransform: 'uppercase'
    },
    reviewNotes: {
      fontFamily: appFonts.body,
      fontSize: t(13),
      lineHeight: t(18),
      color: figmaColors.charcoal
    },
    resubmitBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(4),
      marginTop: s(2)
    },
    resubmit: {
      fontFamily: appFonts.bodyBold,
      fontSize: t(13),
      color: figmaColors.accent
    },
    error: {
      fontFamily: appFonts.body,
      fontSize: t(14),
      color: figmaColors.error
    }
  });
}
