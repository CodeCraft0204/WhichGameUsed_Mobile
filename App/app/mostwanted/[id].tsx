import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { HuntCardImage } from '@/components/most-wanted/HuntCardImage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthPrimaryButton } from '@/components/auth/AuthPrimaryButton';
import { ProfileSubpageHeader } from '@/components/profile/ProfileSubpageHeader';
import { EvidenceChecklist } from '@/components/most-wanted/EvidenceChecklist';
import { EvidenceProgressMeter } from '@/components/most-wanted/EvidenceProgressMeter';
import {
  MostWantedEmptyState,
  MostWantedRewardBadge
} from '@/components/most-wanted/MostWantedShared';
import { SolvedStatusBanner, WantedStatusTagRow } from '@/components/most-wanted/WantedStatusTag';
import { appFonts } from '@/constants/appFonts';
import { mostWantedCopy } from '@/constants/mostWantedCopy';
import { huntCardBorder } from '@/constants/mostWantedStyles';
import {
  databaseCardHref,
  discussionCreateHref,
  discussionThreadHref,
  mostWantedSubmitHref
} from '@/constants/navigation';
import { figmaColors } from '@/constants/figmaColors';
import { useAuth } from '@/context/AuthContext';
import { useFigmaLayout } from '@/hooks/useFigmaLayout';
import { useMostWantedRealtime } from '@/hooks/useMostWantedRealtime';
import {
  claimMostWantedReward,
  formatRewardLabel,
  getMostWantedDetail,
  huntDisplayTitle,
  huntStatusTagsFromLabels,
  leadSummary,
  toggleMostWantedWatch,
  type MostWantedDetailPayload
} from '@/lib/most-wanted';
import { addCardToWishlist } from '@/lib/wishlist';

export default function MostWantedDetailScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { s, t } = useFigmaLayout();
  const styles = useMemo(() => createStyles(s, t), [s, t]);

  const [detail, setDetail] = useState<MostWantedDetailPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [wishlistBusy, setWishlistBusy] = useState(false);
  const [watchBusy, setWatchBusy] = useState(false);
  const [claimBusy, setClaimBusy] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const reload = useCallback(async (opts?: { silent?: boolean }) => {
    if (!id || typeof id !== 'string') return;
    if (!opts?.silent) setLoading(true);
    setError(null);
    const { detail: payload, error: err } = await getMostWantedDetail(id);
    setDetail(payload);
    setError(err);
    setLoading(false);
    setRefreshing(false);
  }, [id]);

  useEffect(() => {
    void reload();
  }, [reload]);

  useMostWantedRealtime(() => void reload({ silent: true }), !!id);

  const hunt = detail?.hunt;
  const fulfilled = detail?.requirements.filter((r) => r.is_fulfilled).length ?? 0;
  const total = detail?.requirements.length ?? 0;
  const statusTags = hunt
    ? huntStatusTagsFromLabels(
        detail!.requirements.filter((r) => !r.is_fulfilled).map((r) => r.label),
        hunt.status,
        hunt.priority_tag,
        fulfilled,
        total
      )
    : [];

  const handleShare = useCallback(async () => {
    if (!hunt) return;
    await Share.share({
      message: `Most Wanted: ${huntDisplayTitle(hunt)} — help find game-used evidence on Which Game Used.`
    });
  }, [hunt]);

  const handleWatch = useCallback(async () => {
    if (!hunt || !user) {
      setActionMessage('Sign in to watch hunts.');
      return;
    }
    setWatchBusy(true);
    const { watching, error: watchError } = await toggleMostWantedWatch(hunt.id);
    setWatchBusy(false);
    if (watchError) setActionMessage(watchError);
    else {
      setActionMessage(watching ? 'Added to your watch list.' : 'Removed from watch list.');
      void reload({ silent: true });
    }
  }, [hunt, reload, user]);

  const handleWishlist = useCallback(async () => {
    if (!user) {
      setActionMessage('Sign in to save cards to your wishlist.');
      return;
    }
    if (!hunt?.card_id) {
      setActionMessage('This hunt is not linked to a catalog card yet.');
      return;
    }

    setWishlistBusy(true);
    const { error: wishError } = await addCardToWishlist(user.id, hunt.card_id);
    setWishlistBusy(false);
    setActionMessage(wishError ? wishError : 'Added to wishlist.');
  }, [hunt, user]);

  const handleClaimReward = useCallback(async () => {
    if (!hunt || !user) return;
    setClaimBusy(true);
    const { claimed, error: claimError } = await claimMostWantedReward(hunt.id);
    setClaimBusy(false);
    if (claimError) setActionMessage(claimError);
    else if (claimed) {
      setActionMessage('Reward claimed. Thanks for helping solve this hunt!');
      void reload({ silent: true });
    }
  }, [hunt, reload, user]);

  const handleDiscuss = useCallback(() => {
    if (hunt?.forum_thread_id) {
      router.push(discussionThreadHref(hunt.forum_thread_id));
      return;
    }
    router.push(
      discussionCreateHref(undefined, {
        initialTitle: hunt ? `Most Wanted: ${huntDisplayTitle(hunt)}` : undefined,
        initialBody: hunt?.summary ?? undefined
      })
    );
  }, [hunt, router]);

  if (!id) {
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={styles.error}>Missing hunt id.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              void reload({ silent: true });
            }}
            tintColor={figmaColors.charcoal}
          />
        }
      >
        <ProfileSubpageHeader
          title="Hunt Detail"
          subtitle={hunt ? huntDisplayTitle(hunt) : undefined}
          s={s}
          t={t}
          onBack={() => router.back()}
        />

        {loading ? <ActivityIndicator color={figmaColors.charcoal} style={{ marginVertical: s(24) }} /> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}

        {hunt && detail ? (
          <>
            {hunt.status === 'solved' ? (
              <SolvedStatusBanner
                solverName={hunt.solver_name}
                solvedAt={hunt.solved_at}
                rewardClaimed={hunt.reward_claimed}
                s={s}
                t={t}
              />
            ) : null}

            <View
              style={[
                styles.heroCard,
                { borderColor: huntCardBorder(hunt.status, statusTags) }
              ]}
            >
              <View style={styles.heroImageWrap}>
                <HuntCardImage
                  coverImageUrl={hunt.cover_image_url}
                  imageUrl={hunt.imageUrl}
                  style={styles.heroImage}
                  framed
                  s={s}
                />
                {hunt.reward_amount_cents > 0 ? (
                  <View style={styles.rewardOverlay}>
                    <MostWantedRewardBadge
                      label={formatRewardLabel(hunt.reward_amount_cents, hunt.reward_label)}
                      s={s}
                      t={t}
                      large
                    />
                  </View>
                ) : null}
              </View>

              <View style={styles.heroBody}>
                <WantedStatusTagRow tags={statusTags} s={s} t={t} />
                <Text style={styles.heroTitle}>{huntDisplayTitle(hunt)}</Text>
                <Text style={styles.meta}>
                  {[hunt.product_year, hunt.manufacturer_name ?? hunt.product_name, hunt.card_number ? `#${hunt.card_number}` : null]
                    .filter(Boolean)
                    .join(' · ')}
                </Text>
                <Text style={styles.meta}>
                  {[hunt.player_name, hunt.team_name, hunt.sport_slug].filter(Boolean).join(' · ')}
                </Text>

                <View style={styles.watcherRow}>
                  <Ionicons name="eye-outline" size={s(14)} color={figmaColors.gray} />
                  <Text style={styles.watchers}>
                    {detail.watcher_count} {mostWantedCopy.watchersSuffix}
                  </Text>
                </View>
              </View>
            </View>

            {hunt.summary ? <Text style={styles.summary}>{hunt.summary}</Text> : null}

            <Text style={styles.sectionTitle}>{mostWantedCopy.detailWhatWeNeed}</Text>
            <EvidenceChecklist items={detail.requirements} s={s} t={t} />

            <Text style={styles.sectionTitle}>{mostWantedCopy.detailProgress}</Text>
            <Text style={styles.progressCopy}>
              {fulfilled} of {total} complete
            </Text>
            <EvidenceProgressMeter
              fulfilled={fulfilled}
              total={total}
              s={s}
              t={t}
              nearComplete={hunt.status === 'near_solved'}
            />

            <Text style={styles.sectionTitle}>{mostWantedCopy.detailReward}</Text>
            <View style={styles.rewardCard}>
              <MostWantedRewardBadge
                label={formatRewardLabel(hunt.reward_amount_cents, hunt.reward_label)}
                s={s}
                t={t}
                large
              />
              <Text style={styles.rewardSub}>Contributor badge available when your evidence is approved.</Text>
            </View>

            <Text style={styles.sectionTitle}>{mostWantedCopy.detailLeads}</Text>
            {detail.leads.length === 0 ? (
              <MostWantedEmptyState
                title="No community leads yet"
                body="Be the first to contribute evidence for this hunt."
                icon="people-outline"
                s={s}
                t={t}
              />
            ) : (
              detail.leads.map((lead) => (
                <View key={lead.id} style={styles.leadRow}>
                  <View style={styles.leadIcon}>
                    <Ionicons name="document-text-outline" size={s(16)} color={figmaColors.accent} />
                  </View>
                  <View style={styles.leadBody}>
                    <Text style={styles.leadText}>{leadSummary(lead)}</Text>
                    {lead.status === 'pending_review' ? (
                      <Text style={styles.leadPending}>Pending review</Text>
                    ) : null}
                  </View>
                </View>
              ))
            )}

            <View style={styles.actions}>
              {hunt.status !== 'solved' ? (
                <AuthPrimaryButton
                  label={mostWantedCopy.detailSubmit}
                  onPress={() => router.push(mostWantedSubmitHref(hunt.id))}
                />
              ) : null}

              {hunt.status === 'solved' && user?.id === hunt.solved_by && !hunt.reward_claimed ? (
                <AuthPrimaryButton
                  label={mostWantedCopy.detailClaimReward}
                  onPress={() => void handleClaimReward()}
                  disabled={claimBusy}
                />
              ) : null}

              {hunt.reward_claimed ? (
                <View style={styles.claimedBanner}>
                  <Ionicons name="checkmark-circle" size={s(18)} color={figmaColors.success} />
                  <Text style={styles.rewardClaimed}>{mostWantedCopy.detailRewardClaimed}</Text>
                </View>
              ) : null}

              <View style={styles.secondaryActions}>
                <ActionButton
                  label={detail.is_watching ? mostWantedCopy.detailWatching : mostWantedCopy.detailWatch}
                  icon="eye-outline"
                  onPress={() => void handleWatch()}
                  disabled={watchBusy}
                />
                {hunt.card_id ? (
                  <ActionButton
                    label={mostWantedCopy.detailWishlist}
                    icon="heart-outline"
                    onPress={() => void handleWishlist()}
                    disabled={wishlistBusy}
                  />
                ) : null}
                <ActionButton label={mostWantedCopy.detailDiscuss} icon="chatbubble-outline" onPress={handleDiscuss} />
                <ActionButton label={mostWantedCopy.detailShare} icon="share-outline" onPress={() => void handleShare()} />
                {hunt.card_id ? (
                  <ActionButton
                    label="View Catalog Card"
                    icon="albums-outline"
                    onPress={() => router.push(databaseCardHref(hunt.card_id!))}
                  />
                ) : null}
              </View>
            </View>

            {actionMessage ? <Text style={styles.actionMessage}>{actionMessage}</Text> : null}
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function ActionButton({
  label,
  icon,
  onPress,
  disabled
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [{ opacity: pressed || disabled ? 0.7 : 1, flex: 1, minWidth: '45%' }]}
    >
      <View style={actionStyles.btn}>
        <Ionicons name={icon} size={16} color={figmaColors.charcoal} />
        <Text style={actionStyles.label}>{label}</Text>
      </View>
    </Pressable>
  );
}

const actionStyles = StyleSheet.create({
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: figmaColors.borderLight,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 10,
    backgroundColor: figmaColors.cream,
    marginBottom: 8
  },
  label: {
    fontFamily: appFonts.body,
    fontSize: 13,
    color: figmaColors.charcoal,
    textAlign: 'center',
    flexShrink: 1
  }
});

function createStyles(s: (n: number) => number, t: (n: number) => number) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: figmaColors.background },
    content: { paddingHorizontal: s(20), paddingBottom: s(32) },
    heroCard: {
      backgroundColor: figmaColors.cream,
      borderWidth: 1,
      borderRadius: s(14),
      overflow: 'hidden',
      marginBottom: s(16)
    },
    heroImageWrap: {
      backgroundColor: figmaColors.assetPreviewBg,
      padding: s(16),
      alignItems: 'center',
      borderBottomWidth: 1,
      borderBottomColor: figmaColors.borderLight
    },
    heroImage: {
      width: '100%',
      height: s(200)
    },
    rewardOverlay: {
      position: 'absolute',
      top: s(12),
      right: s(12)
    },
    heroBody: {
      padding: s(14),
      gap: s(8)
    },
    heroTitle: {
      fontFamily: appFonts.bodyBold,
      fontSize: t(20),
      lineHeight: t(24),
      color: figmaColors.charcoal
    },
    meta: {
      fontFamily: appFonts.body,
      fontSize: t(13),
      color: figmaColors.gray
    },
    watcherRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(6),
      marginTop: s(2)
    },
    watchers: {
      fontFamily: appFonts.body,
      fontSize: t(13),
      color: figmaColors.gray
    },
    summary: {
      fontFamily: appFonts.body,
      fontSize: t(14),
      lineHeight: t(20),
      color: figmaColors.gray,
      marginBottom: s(16)
    },
    sectionTitle: {
      fontFamily: appFonts.display,
      fontSize: t(18),
      color: figmaColors.charcoal,
      marginTop: s(16),
      marginBottom: s(10)
    },
    progressCopy: {
      fontFamily: appFonts.body,
      fontSize: t(14),
      color: figmaColors.gray,
      marginBottom: s(8)
    },
    rewardCard: {
      backgroundColor: figmaColors.tagBg,
      borderRadius: s(12),
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      padding: s(14),
      gap: s(8),
      marginBottom: s(8)
    },
    rewardSub: {
      fontFamily: appFonts.body,
      fontSize: t(12),
      lineHeight: t(17),
      color: figmaColors.gray
    },
    leadRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: s(10),
      backgroundColor: figmaColors.cream,
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      borderRadius: s(10),
      padding: s(12),
      marginBottom: s(8)
    },
    leadIcon: {
      width: s(32),
      height: s(32),
      borderRadius: s(16),
      backgroundColor: figmaColors.surfaceHighlight,
      alignItems: 'center',
      justifyContent: 'center'
    },
    leadBody: { flex: 1, gap: s(4) },
    leadText: {
      fontFamily: appFonts.body,
      fontSize: t(14),
      lineHeight: t(19),
      color: figmaColors.charcoal
    },
    leadPending: {
      fontFamily: appFonts.accent,
      fontSize: t(9),
      letterSpacing: 0.5,
      color: figmaColors.gray,
      textTransform: 'uppercase'
    },
    actions: { marginTop: s(20), gap: s(8) },
    secondaryActions: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: s(8),
      marginTop: s(4)
    },
    actionMessage: {
      fontFamily: appFonts.body,
      fontSize: t(13),
      color: figmaColors.accent,
      marginTop: s(8),
      textAlign: 'center'
    },
    claimedBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: s(8),
      backgroundColor: figmaColors.successBg,
      borderWidth: 1,
      borderColor: figmaColors.success,
      borderRadius: s(10),
      padding: s(12)
    },
    rewardClaimed: {
      fontFamily: appFonts.bodyBold,
      fontSize: t(14),
      color: figmaColors.success
    },
    error: {
      fontFamily: appFonts.body,
      fontSize: t(14),
      color: figmaColors.error
    }
  });
}
