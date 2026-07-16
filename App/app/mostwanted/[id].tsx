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
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthPrimaryButton } from '@/components/auth/AuthPrimaryButton';
import { ProfileSubpageHeader } from '@/components/profile/ProfileSubpageHeader';
import { EvidenceChecklist } from '@/components/most-wanted/EvidenceChecklist';
import { EvidenceProgressMeter } from '@/components/most-wanted/EvidenceProgressMeter';
import { HuntCardImage } from '@/components/most-wanted/HuntCardImage';
import {
  MostWantedContributorBadge,
  MostWantedEmptyState
} from '@/components/most-wanted/MostWantedShared';
import { SolvedStatusBanner, WantedStatusTagRow } from '@/components/most-wanted/WantedStatusTag';
import { appFonts } from '@/constants/appFonts';
import { databaseCopy } from '@/constants/databaseCopy';
import { mostWantedBadgeCatalog, mostWantedCopy } from '@/constants/mostWantedCopy';
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
  getMostWantedDetail,
  huntDisplayTitle,
  huntStatusTagsFromLabels,
  leadSummary,
  listHuntContributorBadges,
  toggleMostWantedWatch,
  type MostWantedContributorBadgeRow,
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
  const [badges, setBadges] = useState<MostWantedContributorBadgeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [wishlistBusy, setWishlistBusy] = useState(false);
  const [watchBusy, setWatchBusy] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const reload = useCallback(
    async (opts?: { silent?: boolean }) => {
      if (!id || typeof id !== 'string') return;
      if (!opts?.silent) setLoading(true);
      setError(null);
      const [{ detail: payload, error: err }, badgesRes] = await Promise.all([
        getMostWantedDetail(id),
        listHuntContributorBadges(id)
      ]);
      setDetail(payload);
      setBadges(badgesRes.items);
      setError(err ?? badgesRes.error);
      setLoading(false);
      setRefreshing(false);
    },
    [id]
  );

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
      setActionMessage('Sign in to watch this card.');
      return;
    }
    setWatchBusy(true);
    const { watching, error: watchError } = await toggleMostWantedWatch(hunt.id);
    setWatchBusy(false);
    if (watchError) setActionMessage(watchError);
    else {
      setActionMessage(watching ? 'Added to your watched list.' : 'Removed from watched list.');
      void reload({ silent: true });
    }
  }, [hunt, reload, user]);

  const handleWishlist = useCallback(async () => {
    if (!user) {
      setActionMessage('Sign in to save cards to your wishlist.');
      return;
    }
    if (!hunt?.card_id) {
      setActionMessage('This Most Wanted card is not linked to the catalog yet.');
      return;
    }

    setWishlistBusy(true);
    const { error: wishError } = await addCardToWishlist(user.id, hunt.card_id);
    setWishlistBusy(false);
    setActionMessage(wishError ? wishError : databaseCopy.wishlistAddedFromMostWanted);
  }, [hunt, user]);

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
        <Text style={styles.error}>Missing Most Wanted card.</Text>
      </SafeAreaView>
    );
  }

  const myBadges = user ? badges.filter((b) => b.user_id === user.id) : [];
  const uniqueContributors = [...new Set(badges.map((b) => b.display_name))];

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.page}>
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
            title={mostWantedCopy.detailTitle}
            subtitle={hunt ? huntDisplayTitle(hunt) : undefined}
            s={s}
            t={t}
            onBack={() => router.back()}
          />

          {loading ? (
            <ActivityIndicator color={figmaColors.charcoal} style={{ marginVertical: s(24) }} />
          ) : null}
          {error ? <Text style={styles.error}>{error}</Text> : null}

          {hunt && detail ? (
            <>
              {hunt.status === 'solved' ? (
                <SolvedStatusBanner
                  solverName={hunt.solver_name}
                  solvedAt={hunt.solved_at}
                  s={s}
                  t={t}
                />
              ) : null}

              <View
                style={[styles.heroCard, { borderColor: huntCardBorder(hunt.status, statusTags) }]}
              >
                <View style={styles.heroImageWrap}>
                  <HuntCardImage
                    coverImageUrl={hunt.cover_image_url}
                    imageUrl={hunt.imageUrl}
                    style={styles.heroImage}
                    framed
                    s={s}
                  />
                  <View style={styles.rewardOverlay}>
                    <MostWantedContributorBadge
                      label={mostWantedCopy.badgeCreditChip}
                      s={s}
                      t={t}
                      large
                      icon="ribbon"
                    />
                  </View>
                </View>

                <View style={styles.heroBody}>
                  <WantedStatusTagRow tags={statusTags} s={s} t={t} />
                  <Text style={styles.heroTitle}>{huntDisplayTitle(hunt)}</Text>
                  <Text style={styles.meta}>
                    {[
                      hunt.product_year,
                      hunt.manufacturer_name ?? hunt.product_name,
                      hunt.card_number ? `#${hunt.card_number}` : null
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </Text>
                  <Text style={styles.meta}>
                    {[hunt.player_name, hunt.team_name, hunt.sport_slug].filter(Boolean).join(' · ')}
                  </Text>
                </View>
              </View>

              <View style={styles.statusBar}>
                <View style={styles.statusBarItem}>
                  <MostWantedContributorBadge
                    label={mostWantedCopy.badgeCreditChip}
                    s={s}
                    t={t}
                    icon="ribbon"
                  />
                </View>
                <Pressable
                  style={styles.statusBarWatch}
                  onPress={() => void handleWatch()}
                  disabled={watchBusy}
                >
                  <Ionicons
                    name={detail.is_watching ? 'eye' : 'eye-outline'}
                    size={s(16)}
                    color={figmaColors.charcoal}
                  />
                  <Text style={styles.statusBarWatchText}>
                    {detail.is_watching ? mostWantedCopy.detailWatching : mostWantedCopy.detailWatch}
                  </Text>
                </Pressable>
                <View style={styles.watcherRow}>
                  <Text style={styles.watchers}>
                    {detail.watcher_count} {mostWantedCopy.watchersSuffix}
                  </Text>
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

              <Text style={styles.sectionTitle}>{mostWantedCopy.detailLeads}</Text>
              {detail.leads.length === 0 ? (
                <MostWantedEmptyState
                  title="No submissions yet"
                  body="Be the first to contribute evidence for this card."
                  icon="people-outline"
                  s={s}
                  t={t}
                />
              ) : (
                detail.leads.map((lead) => (
                  <View key={lead.id} style={styles.leadRow}>
                    <View style={styles.leadIcon}>
                      <Ionicons
                        name="document-text-outline"
                        size={s(16)}
                        color={figmaColors.accent}
                      />
                    </View>
                    <View style={styles.leadBody}>
                      <Text style={styles.leadText}>{leadSummary(lead)}</Text>
                      {lead.status === 'pending_review' ? (
                        <Text style={styles.leadPending}>Pending review</Text>
                      ) : null}
                      {lead.status === 'approved' ? (
                        <Text style={styles.leadApproved}>Approved</Text>
                      ) : null}
                      {lead.status === 'needs_more_info' ? (
                        <Text style={styles.leadPending}>Needs more info</Text>
                      ) : null}
                    </View>
                  </View>
                ))
              )}

              <Text style={styles.sectionTitle}>
                {hunt.status === 'solved'
                  ? mostWantedCopy.detailContributors
                  : mostWantedCopy.detailBadgePanel}
              </Text>
              <View style={styles.rewardCard}>
                <MostWantedContributorBadge
                  label={
                    hunt.status === 'solved'
                      ? mostWantedCopy.detailBadgeCredit
                      : mostWantedCopy.detailBadgePanel
                  }
                  s={s}
                  t={t}
                  large
                  icon="ribbon"
                />
                <Text style={styles.rewardSub}>{mostWantedCopy.detailBadgeBody}</Text>
                {hunt.status !== 'solved' ? (
                  <>
                    <Text style={styles.badgeGroupLabel}>{mostWantedCopy.detailBadgesAvailable}</Text>
                    <View style={styles.badgeWrap}>
                      {mostWantedBadgeCatalog.map((badge) => (
                        <MostWantedContributorBadge
                          key={badge.key}
                          label={badge.label}
                          icon={badge.icon}
                          s={s}
                          t={t}
                        />
                      ))}
                    </View>
                  </>
                ) : null}
                {myBadges.length > 0 ? (
                  <>
                    <Text style={styles.badgeGroupLabel}>{mostWantedCopy.detailYourBadges}</Text>
                    <View style={styles.badgeWrap}>
                      {myBadges.map((badge) => (
                        <MostWantedContributorBadge
                          key={badge.id}
                          label={badge.badge_label}
                          s={s}
                          t={t}
                          icon="checkmark-circle"
                        />
                      ))}
                    </View>
                  </>
                ) : null}
                {hunt.status === 'solved' ? (
                  <>
                    {uniqueContributors.length > 0 ? (
                      <Text style={styles.rewardSub}>
                        Recognized: {uniqueContributors.join(', ')}
                      </Text>
                    ) : (
                      <Text style={styles.rewardSub}>{mostWantedCopy.emptyBadges}</Text>
                    )}
                    {badges.length > 0 ? (
                      <View style={styles.badgeWrap}>
                        {badges.slice(0, 8).map((badge) => (
                          <MostWantedContributorBadge
                            key={badge.id}
                            label={`${badge.display_name}: ${badge.badge_label}`}
                            s={s}
                            t={t}
                            icon="ribbon"
                          />
                        ))}
                      </View>
                    ) : null}
                  </>
                ) : null}
              </View>

              <View style={styles.secondaryActions}>
                {hunt.card_id ? (
                  <ActionButton
                    label={mostWantedCopy.detailWishlist}
                    icon="heart-outline"
                    onPress={() => void handleWishlist()}
                    disabled={wishlistBusy}
                  />
                ) : null}
                <ActionButton
                  label={mostWantedCopy.detailDiscuss}
                  icon="chatbubble-outline"
                  onPress={handleDiscuss}
                />
                <ActionButton
                  label={mostWantedCopy.detailShare}
                  icon="share-outline"
                  onPress={() => void handleShare()}
                />
                {hunt.card_id ? (
                  <ActionButton
                    label={mostWantedCopy.detailViewCatalog}
                    icon="albums-outline"
                    onPress={() => router.push(databaseCardHref(hunt.card_id!))}
                  />
                ) : null}
              </View>

              {actionMessage ? <Text style={styles.actionMessage}>{actionMessage}</Text> : null}
            </>
          ) : null}
        </ScrollView>

        {hunt && !loading ? (
          <View style={styles.stickyCta}>
            {hunt.status !== 'solved' ? (
              <AuthPrimaryButton
                label={mostWantedCopy.detailSubmit}
                onPress={() => router.push(mostWantedSubmitHref(hunt.id))}
              />
            ) : (
              <View style={styles.stickyIdle}>
                <Text style={styles.stickyIdleText}>This Most Wanted card is solved.</Text>
              </View>
            )}
          </View>
        ) : null}
      </View>
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
    page: { flex: 1 },
    content: { paddingHorizontal: s(20), paddingBottom: s(120) },
    heroCard: {
      backgroundColor: figmaColors.cream,
      borderWidth: 1,
      borderRadius: s(14),
      overflow: 'hidden',
      marginBottom: s(12)
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
    statusBar: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: s(10),
      backgroundColor: figmaColors.cream,
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      borderRadius: s(12),
      paddingHorizontal: s(12),
      paddingVertical: s(10),
      marginBottom: s(14)
    },
    statusBarItem: { flexShrink: 0 },
    statusBarWatch: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(6),
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      borderRadius: s(999),
      paddingHorizontal: s(10),
      paddingVertical: s(6),
      backgroundColor: figmaColors.background
    },
    statusBarWatchText: {
      fontFamily: appFonts.accent,
      fontSize: t(11),
      color: figmaColors.charcoal
    },
    watcherRow: {
      marginLeft: 'auto' as const
    },
    watchers: {
      fontFamily: appFonts.body,
      fontSize: t(12),
      color: figmaColors.gray
    },
    summary: {
      fontFamily: appFonts.body,
      fontSize: t(14),
      lineHeight: t(20),
      color: figmaColors.gray,
      marginBottom: s(8)
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
    leadApproved: {
      fontFamily: appFonts.accent,
      fontSize: t(9),
      letterSpacing: 0.5,
      color: figmaColors.success,
      textTransform: 'uppercase'
    },
    secondaryActions: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: s(8),
      marginTop: s(16)
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
      gap: s(8),
      backgroundColor: figmaColors.successBg,
      borderWidth: 1,
      borderColor: figmaColors.success,
      borderRadius: s(10),
      padding: s(10)
    },
    rewardClaimed: {
      fontFamily: appFonts.bodyBold,
      fontSize: t(13),
      color: figmaColors.success,
      flex: 1
    },
    badgeGroupLabel: {
      fontFamily: appFonts.bodyBold,
      fontSize: t(12),
      color: figmaColors.charcoal,
      marginTop: s(4)
    },
    badgeWrap: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: s(6)
    },
    stickyCta: {
      borderTopWidth: 1,
      borderTopColor: figmaColors.borderLight,
      backgroundColor: figmaColors.background,
      paddingHorizontal: s(20),
      paddingTop: s(12),
      paddingBottom: s(10)
    },
    stickyIdle: {
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      borderRadius: s(10),
      backgroundColor: figmaColors.cream,
      paddingVertical: s(14),
      paddingHorizontal: s(12),
      alignItems: 'center'
    },
    stickyIdleText: {
      fontFamily: appFonts.body,
      fontSize: t(14),
      color: figmaColors.gray,
      textAlign: 'center'
    },
    error: {
      fontFamily: appFonts.body,
      fontSize: t(14),
      color: figmaColors.error
    }
  });
}
