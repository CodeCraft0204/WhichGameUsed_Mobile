import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ProfileSubpageHeader } from '@/components/profile/ProfileSubpageHeader';
import { HuntCardImage } from '@/components/most-wanted/HuntCardImage';
import {
  MostWantedContributorBadge,
  MostWantedEmptyState
} from '@/components/most-wanted/MostWantedShared';
import { SolvedStatusBanner, WantedStatusTagRow } from '@/components/most-wanted/WantedStatusTag';
import { appFonts } from '@/constants/appFonts';
import { databaseCopy } from '@/constants/databaseCopy';
import {
  mostWantedBadgeCatalog,
  mostWantedCopy,
  mostWantedEvidenceTypes
} from '@/constants/mostWantedCopy';
import { mostWantedIcons } from '@/constants/mostWantedContent';
import { contributionStatusColors, type MwContributionStatus } from '@/constants/mostWantedStyles';
import {
  databaseCardHref,
  discussionCreateHref,
  discussionThreadHref,
  mostWantedHref,
  mostWantedSubmitHref,
  safeGoBack
} from '@/constants/navigation';
import { figmaColors } from '@/constants/figmaColors';
import { useAuth } from '@/context/AuthContext';
import { useFigmaLayout } from '@/hooks/useFigmaLayout';
import { useMostWantedRealtime } from '@/hooks/useMostWantedRealtime';
import {
  evidenceTypeLabel,
  getMostWantedDetail,
  huntDisplayTitle,
  huntEngagementMetrics,
  huntStatusTagsFromLabels,
  listHuntContributorBadges,
  relativeTime,
  requirementCollectionStatus,
  toggleMostWantedWatch,
  type CollectionStatus,
  type MostWantedContributorBadgeRow,
  type MostWantedDetailPayload,
  type MostWantedLead,
  type MostWantedRequirement
} from '@/lib/most-wanted';
import { addCardToWishlist } from '@/lib/wishlist';

const LEADS_PREVIEW_COUNT = 3;

function requirementIcon(requirementKey: string): number {
  const key = requirementKey.toLowerCase();
  if (key.includes('front') || key.includes('back')) return mostWantedIcons.evidenceImage;
  if (key.includes('source') || key.includes('link')) return mostWantedIcons.evidenceLink;
  if (key.includes('jersey') || key.includes('relic')) return mostWantedIcons.evidenceJersey;
  if (key.includes('note') || key.includes('research')) return mostWantedIcons.evidenceNote;
  if (key.includes('screenshot') || key.includes('photo')) return mostWantedIcons.evidenceCamera;
  return mostWantedIcons.evidenceDoc;
}

function requirementHint(requirementKey: string): string | null {
  const match = mostWantedEvidenceTypes.find((type) => requirementKey.includes(type.key));
  return match?.hint ?? null;
}

function leadStatusChip(status: string): { label: string; status: MwContributionStatus } {
  switch (status) {
    case 'approved':
      return { label: 'STRONG', status: 'approved' };
    case 'needs_more_info':
      return { label: 'POTENTIAL', status: 'needs_more_info' };
    case 'rejected':
      return { label: 'REJECTED', status: 'rejected' };
    default:
      return { label: 'NEEDS REVIEW', status: 'pending_review' };
  }
}

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
  const [showAllBadges, setShowAllBadges] = useState(false);
  const [showAllLeads, setShowAllLeads] = useState(false);

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
  const pct = total > 0 ? Math.min(100, Math.round((fulfilled / total) * 100)) : 0;
  const remaining = Math.max(total - fulfilled, 0);
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
  const engagement = detail
    ? huntEngagementMetrics({
        watcher_count: detail.watcher_count,
        contributor_count: detail.contributor_count,
        evidence_submission_count: detail.evidence_submission_count ?? detail.leads.length,
        comment_count: detail.comment_count
      })
    : null;
  const neededItems =
    detail?.requirements.filter((r) => requirementCollectionStatus(r) !== 'collected') ?? [];
  const visibleLeads = showAllLeads
    ? detail?.leads ?? []
    : (detail?.leads ?? []).slice(0, LEADS_PREVIEW_COUNT);

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
            onBack={() => safeGoBack(mostWantedHref())}
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

              {hunt.featured_at ? (
                <View style={styles.featuredBanner}>
                  <Image
                    source={mostWantedIcons.starFilled}
                    style={styles.featuredBannerStar}
                    resizeMode="contain"
                  />
                  <Text style={styles.featuredBannerText}>FEATURED</Text>
                </View>
              ) : null}

              {/* Hero: open layout — framed card image left, identity right (Figma frame 1:1126) */}
              <View style={styles.heroRow}>
                <View style={styles.heroImageCol}>
                  <HuntCardImage
                    coverImageUrl={hunt.cover_image_url}
                    imageUrl={hunt.imageUrl}
                    style={styles.heroImage}
                    framed
                    s={s}
                  />
                </View>
                <View style={styles.heroBody}>
                  <WantedStatusTagRow tags={statusTags} s={s} t={t} />
                  <Text style={styles.heroTitle}>{huntDisplayTitle(hunt)}</Text>
                  <Text style={styles.meta}>
                    {[
                      hunt.team_name,
                      hunt.product_year,
                      hunt.manufacturer_name ?? hunt.product_name,
                      hunt.card_number ? `#${hunt.card_number}` : null
                    ]
                      .filter(Boolean)
                      .join(' • ')}
                  </Text>
                  {hunt.summary ? <Text style={styles.heroSummary}>{hunt.summary}</Text> : null}
                </View>
              </View>

              {/* Stat strip between hairlines */}
              <View style={styles.statStrip}>
                <View style={styles.statCell}>
                  <View style={styles.statValueRow}>
                    <Image source={mostWantedIcons.eyeDark} style={styles.statIcon} resizeMode="contain" />
                    <Text style={styles.statValue}>{engagement?.watching ?? 0}</Text>
                  </View>
                  <Text style={styles.statLabel}>Watching</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statCell}>
                  <View style={styles.statValueRow}>
                    <Image source={mostWantedIcons.people} style={styles.statIcon} resizeMode="contain" />
                    <Text style={styles.statValue}>{engagement?.middleValue ?? 0}</Text>
                  </View>
                  <Text style={styles.statLabel}>{engagement?.middleLabel ?? 'Evidence'}</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statCell}>
                  <View style={styles.statValueRow}>
                    <Image source={mostWantedIcons.commentDark} style={styles.statIcon} resizeMode="contain" />
                    <Text style={styles.statValue}>{engagement?.comments ?? 0}</Text>
                  </View>
                  <Text style={styles.statLabel}>Comments</Text>
                </View>
              </View>

              {/* Evidence progress */}
              <View style={styles.progressBlock}>
                <View style={styles.progressHeader}>
                  <Image
                    source={mostWantedIcons.evidenceDoc}
                    style={styles.progressIcon}
                    resizeMode="contain"
                  />
                  <Text style={styles.progressTitle}>EVIDENCE PROGRESS</Text>
                  <Text style={styles.progressPct}>{pct}% Complete</Text>
                </View>
                <View style={styles.progressTrack}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${pct}%`,
                        backgroundColor:
                          hunt.status === 'near_solved' || pct >= 75
                            ? figmaColors.success
                            : figmaColors.progressFill
                      }
                    ]}
                  />
                </View>
                <View style={styles.progressFooter}>
                  <Text style={styles.progressFootText}>
                    {fulfilled} of {total} evidence items collected
                  </Text>
                  <Text style={styles.progressFootText}>{remaining} items remaining</Text>
                </View>
              </View>

              {/* Badge recognition */}
              <View style={styles.badgePanel}>
                <View style={styles.badgePanelHeader}>
                  <Image
                    source={mostWantedIcons.trophy}
                    style={styles.badgePanelTrophy}
                    resizeMode="contain"
                  />
                  <Text style={styles.badgePanelTitle}>BADGE RECOGNITION</Text>
                </View>
                <View style={styles.badgePanelRow}>
                  <View style={styles.badgePanelTextCol}>
                    <Text style={styles.badgePanelBody}>{mostWantedCopy.detailBadgeBody}</Text>
                    <Pressable
                      onPress={() => setShowAllBadges((v) => !v)}
                      style={styles.badgePanelBtn}
                      accessibilityRole="button"
                    >
                      <Text style={styles.badgePanelBtnText}>
                        {showAllBadges ? 'HIDE BADGES' : 'VIEW ALL BADGES'}
                      </Text>
                      <Image
                        source={mostWantedIcons.ctaArrow}
                        style={styles.badgePanelBtnArrow}
                        resizeMode="contain"
                      />
                    </Pressable>
                  </View>
                  <Image
                    source={mostWantedIcons.badgeCluster}
                    style={styles.badgeCluster}
                    resizeMode="contain"
                  />
                </View>
                {showAllBadges && hunt.status !== 'solved' ? (
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
                    <Text style={styles.badgeGroupLabel}>{mostWantedCopy.detailContributors}</Text>
                    {uniqueContributors.length > 0 ? (
                      <Text style={styles.badgePanelBody}>
                        Recognized: {uniqueContributors.join(', ')}
                      </Text>
                    ) : (
                      <Text style={styles.badgePanelBody}>{mostWantedCopy.emptyBadges}</Text>
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

              {/* Evidence tile grid */}
              <View style={styles.tileGrid}>
                {detail.requirements.map((req) => (
                  <EvidenceTile key={req.id} requirement={req} s={s} t={t} />
                ))}
              </View>

              {/* What we need + community leads */}
              {neededItems.length > 0 ? (
                <View style={styles.sectionBox}>
                  <Text style={styles.sectionBoxTitle}>WHAT WE NEED</Text>
                  {neededItems.map((req, index) => {
                    const status = requirementCollectionStatus(req);
                    const chip = collectionStatusChip(status);
                    return (
                      <Pressable
                        key={req.id}
                        onPress={() => router.push(mostWantedSubmitHref(hunt.id))}
                        style={[styles.needRow, index > 0 && styles.rowDividerTop]}
                        accessibilityRole="button"
                        accessibilityLabel={`Submit ${req.label}`}
                      >
                        <Image
                          source={requirementIcon(req.requirement_key)}
                          style={styles.needIcon}
                          resizeMode="contain"
                        />
                        <View style={styles.needBody}>
                          <Text style={styles.needTitle}>{req.label}</Text>
                          {requirementHint(req.requirement_key) ? (
                            <Text style={styles.needHint} numberOfLines={2}>
                              {requirementHint(req.requirement_key)}
                            </Text>
                          ) : null}
                        </View>
                        <View
                          style={[
                            styles.statusChip,
                            { backgroundColor: chip.bg, borderColor: chip.border }
                          ]}
                        >
                          <Text style={[styles.statusChipText, { color: chip.color }]}>
                            {chip.label}
                          </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={s(14)} color={figmaColors.taupe} />
                      </Pressable>
                    );
                  })}
                </View>
              ) : null}

              <View style={styles.sectionBox}>
                <View style={styles.leadsHeader}>
                  <Text style={styles.sectionBoxTitle}>COMMUNITY LEADS</Text>
                </View>
                {detail.leads.length === 0 ? (
                  <MostWantedEmptyState
                    title="No submissions yet"
                    body="Be the first to contribute evidence for this card."
                    icon="people-outline"
                    s={s}
                    t={t}
                  />
                ) : (
                  <>
                    {visibleLeads.map((lead, index) => (
                      <LeadRow key={lead.id} lead={lead} first={index === 0} s={s} t={t} />
                    ))}
                    {detail.leads.length > LEADS_PREVIEW_COUNT ? (
                      <Pressable
                        onPress={() => setShowAllLeads((v) => !v)}
                        style={styles.seeAllLeads}
                        accessibilityRole="button"
                      >
                        <Text style={styles.seeAllLeadsText}>
                          {showAllLeads ? 'SHOW FEWER LEADS' : 'SEE ALL LEADS'}
                        </Text>
                        <Image
                          source={mostWantedIcons.ctaArrow}
                          style={styles.seeAllLeadsArrow}
                          resizeMode="contain"
                        />
                      </Pressable>
                    ) : null}
                  </>
                )}
              </View>

              {/* Secondary actions kept from current version */}
              <View style={styles.secondaryActions}>
                {hunt.card_id ? (
                  <ActionButton
                    label={mostWantedCopy.detailWishlist}
                    icon="heart-outline"
                    onPress={() => void handleWishlist()}
                    disabled={wishlistBusy}
                  />
                ) : null}
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
              <Pressable
                onPress={() => router.push(mostWantedSubmitHref(hunt.id))}
                style={({ pressed }) => [styles.submitCta, pressed && { opacity: 0.9 }]}
                accessibilityRole="button"
                accessibilityLabel={mostWantedCopy.detailSubmit}
              >
                <Image
                  source={mostWantedIcons.ctaShield}
                  style={styles.submitCtaShield}
                  resizeMode="contain"
                />
                <View>
                  <Text style={styles.submitCtaTitle}>SUBMIT EVIDENCE</Text>
                  <Text style={styles.submitCtaSub}>HELP COMPLETE THIS CARD</Text>
                </View>
              </Pressable>
            ) : (
              <View style={styles.stickyIdle}>
                <Text style={styles.stickyIdleText}>This Most Wanted card is solved.</Text>
              </View>
            )}

            <View style={styles.bottomBar}>
              <Pressable style={styles.bottomBarItem} onPress={handleDiscuss} accessibilityRole="button">
                <Image source={mostWantedIcons.discuss} style={styles.bottomBarIcon} resizeMode="contain" />
                <View>
                  <Text style={styles.bottomBarLabel}>DISCUSS</Text>
                  <Text style={styles.bottomBarSub}>Join the conversation</Text>
                </View>
              </Pressable>
              <View style={styles.bottomBarDivider} />
              <Pressable
                style={styles.bottomBarItem}
                onPress={() => void handleWatch()}
                disabled={watchBusy}
                accessibilityRole="button"
              >
                <Image
                  source={detail?.is_watching ? mostWantedIcons.starFilled : mostWantedIcons.watchStar}
                  style={styles.bottomBarIcon}
                  resizeMode="contain"
                />
                <View>
                  <Text style={styles.bottomBarLabel}>
                    {detail?.is_watching ? 'WATCHING' : 'WATCH'}
                  </Text>
                  <Text style={styles.bottomBarSub}>Track this card</Text>
                </View>
              </Pressable>
              <View style={styles.bottomBarDivider} />
              <Pressable
                style={styles.bottomBarItem}
                onPress={() => void handleShare()}
                accessibilityRole="button"
              >
                <Image source={mostWantedIcons.share} style={styles.bottomBarIcon} resizeMode="contain" />
                <View>
                  <Text style={styles.bottomBarLabel}>SHARE</Text>
                  <Text style={styles.bottomBarSub}>Invite others</Text>
                </View>
              </Pressable>
            </View>
          </View>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

function collectionStatusChip(status: CollectionStatus): {
  label: string;
  color: string;
  bg: string;
  border: string;
  icon: keyof typeof Ionicons.glyphMap;
} {
  if (status === 'collected') {
    return {
      label: 'COLLECTED',
      color: figmaColors.success,
      bg: figmaColors.successBg,
      border: figmaColors.success,
      icon: 'checkmark-circle'
    };
  }
  if (status === 'partial') {
    return {
      label: 'PARTIAL',
      color: '#B86B2E',
      bg: '#F8F0E6',
      border: '#D4A574',
      icon: 'ellipse'
    };
  }
  return {
    label: 'MISSING',
    color: figmaColors.error,
    bg: figmaColors.errorBg,
    border: figmaColors.errorBorder,
    icon: 'ellipse-outline'
  };
}

function EvidenceTile({
  requirement,
  s,
  t
}: {
  requirement: MostWantedRequirement;
  s: (n: number) => number;
  t: (n: number) => number;
}) {
  const styles = useMemo(() => createTileStyles(s, t), [s, t]);
  const status = requirementCollectionStatus(requirement);
  const chip = collectionStatusChip(status);
  return (
    <View style={styles.tile}>
      <Image
        source={requirementIcon(requirement.requirement_key)}
        style={styles.icon}
        resizeMode="contain"
      />
      <Text style={styles.label} numberOfLines={2}>
        {requirement.label}
      </Text>
      <View style={styles.statusRow}>
        <Ionicons name={chip.icon} size={s(11)} color={chip.color} />
        <Text style={[styles.statusText, { color: chip.color }]}>
          {status === 'collected' ? 'Collected' : status === 'partial' ? 'Partial' : 'Missing'}
        </Text>
      </View>
    </View>
  );
}

function LeadRow({
  lead,
  first,
  s,
  t
}: {
  lead: MostWantedLead;
  first: boolean;
  s: (n: number) => number;
  t: (n: number) => number;
}) {
  const styles = useMemo(() => createLeadStyles(s, t), [s, t]);
  const chip = leadStatusChip(lead.status);
  const chipColors = contributionStatusColors(chip.status);

  return (
    <View style={[styles.row, !first && styles.rowDivider]}>
      <View style={styles.iconWrap}>
        {lead.imageUrl ? (
          <Image source={{ uri: lead.imageUrl }} style={styles.thumb} resizeMode="cover" />
        ) : (
          <Image
            source={requirementIcon(lead.evidence_type)}
            style={styles.icon}
            resizeMode="contain"
          />
        )}
      </View>
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={1}>
          {evidenceTypeLabel(lead.evidence_type)}
        </Text>
        <Text style={styles.by} numberOfLines={1}>
          by {lead.submitter_name}
        </Text>
        <Text style={styles.meta}>
          {relativeTime(lead.created_at)} • {evidenceTypeLabel(lead.evidence_type)}
        </Text>
      </View>
      <View
        style={[styles.chip, { backgroundColor: chipColors.bg, borderColor: chipColors.border }]}
      >
        <Text style={[styles.chipText, { color: chipColors.text }]}>{chip.label}</Text>
      </View>
    </View>
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

function createTileStyles(s: (n: number) => number, t: (n: number) => number) {
  return StyleSheet.create({
    tile: {
      width: '31.5%',
      backgroundColor: figmaColors.surfaceElevated,
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      borderRadius: s(9),
      paddingVertical: s(12),
      paddingHorizontal: s(6),
      alignItems: 'center',
      gap: s(6)
    },
    icon: {
      width: s(28),
      height: s(26)
    },
    label: {
      fontFamily: appFonts.bodyBold,
      fontSize: t(12),
      lineHeight: t(15),
      color: figmaColors.brownMuted,
      textAlign: 'center',
      minHeight: t(30)
    },
    statusRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(4)
    },
    statusText: {
      fontFamily: appFonts.body,
      fontSize: t(11)
    }
  });
}

function createLeadStyles(s: (n: number) => number, t: (n: number) => number) {
  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(10),
      paddingVertical: s(10)
    },
    rowDivider: {
      borderTopWidth: 1,
      borderTopColor: figmaColors.divider
    },
    iconWrap: {
      width: s(40),
      height: s(40),
      borderRadius: s(8),
      backgroundColor: figmaColors.surfaceMuted,
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden'
    },
    icon: { width: s(20), height: s(20) },
    thumb: { width: '100%', height: '100%' },
    body: { flex: 1, gap: s(1) },
    title: {
      fontFamily: appFonts.bodyBold,
      fontSize: t(13),
      color: figmaColors.charcoal
    },
    by: {
      fontFamily: appFonts.body,
      fontSize: t(11),
      color: figmaColors.grayMuted
    },
    meta: {
      fontFamily: appFonts.body,
      fontSize: t(11),
      color: figmaColors.grayMuted
    },
    chip: {
      borderWidth: 1,
      borderRadius: s(5),
      paddingHorizontal: s(7),
      paddingVertical: s(4)
    },
    chipText: {
      fontFamily: appFonts.accent,
      fontSize: t(9),
      letterSpacing: 0.4
    }
  });
}

function createStyles(s: (n: number) => number, t: (n: number) => number) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: figmaColors.background },
    page: { flex: 1 },
    content: { paddingHorizontal: s(20), paddingBottom: s(24) },

    featuredBanner: {
      alignSelf: 'flex-start',
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(7),
      backgroundColor: figmaColors.stone,
      borderWidth: 1,
      borderColor: figmaColors.borderStrong,
      borderTopLeftRadius: s(16),
      borderBottomRightRadius: s(10),
      paddingHorizontal: s(14),
      paddingVertical: s(6),
      marginBottom: s(10)
    },
    featuredBannerStar: { width: s(12), height: s(12) },
    featuredBannerText: {
      fontFamily: appFonts.accent,
      fontSize: t(11),
      letterSpacing: 1,
      color: figmaColors.brown
    },

    heroRow: {
      flexDirection: 'row',
      gap: s(16),
      marginTop: s(6),
      marginBottom: s(16)
    },
    heroImageCol: { width: '45%' },
    heroImage: {
      width: '100%',
      height: s(200)
    },
    heroBody: {
      flex: 1,
      gap: s(8),
      justifyContent: 'center'
    },
    heroTitle: {
      fontFamily: appFonts.bodyBold,
      fontSize: t(21),
      lineHeight: t(26),
      color: figmaColors.charcoal
    },
    meta: {
      fontFamily: appFonts.body,
      fontSize: t(14),
      color: figmaColors.gray
    },
    heroSummary: {
      fontFamily: appFonts.body,
      fontSize: t(14),
      lineHeight: t(19),
      color: figmaColors.brownMuted
    },

    statStrip: {
      flexDirection: 'row',
      alignItems: 'stretch',
      borderTopWidth: 2,
      borderTopColor: figmaColors.stoneDark,
      borderBottomWidth: 1,
      borderBottomColor: figmaColors.borderLight,
      paddingVertical: s(12),
      marginBottom: s(14)
    },
    statCell: {
      flex: 1,
      alignItems: 'center',
      gap: s(3)
    },
    statValueRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(7)
    },
    statIcon: { width: s(17), height: s(15) },
    statValue: {
      fontFamily: appFonts.bodyBold,
      fontSize: t(17),
      color: figmaColors.charcoal
    },
    statLabel: {
      fontFamily: appFonts.body,
      fontSize: t(13),
      color: figmaColors.gray
    },
    statDivider: {
      width: 1,
      backgroundColor: figmaColors.borderLight
    },

    progressBlock: { marginBottom: s(16), gap: s(7) },
    progressHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(7)
    },
    progressIcon: { width: s(12), height: s(15) },
    progressTitle: {
      flex: 1,
      fontFamily: appFonts.accent,
      fontSize: t(13),
      letterSpacing: 0.5,
      color: figmaColors.brown
    },
    progressPct: {
      fontFamily: appFonts.body,
      fontSize: t(13),
      color: figmaColors.gray
    },
    progressTrack: {
      height: s(8),
      backgroundColor: figmaColors.progressTrack,
      borderRadius: s(4),
      overflow: 'hidden'
    },
    progressFill: {
      height: '100%',
      borderRadius: s(4)
    },
    progressFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between'
    },
    progressFootText: {
      fontFamily: appFonts.body,
      fontSize: t(12),
      color: figmaColors.grayMuted
    },

    badgePanel: {
      backgroundColor: figmaColors.tagBg,
      borderWidth: 1,
      borderColor: figmaColors.borderStrong,
      borderRadius: s(10),
      padding: s(14),
      gap: s(8),
      marginBottom: s(14)
    },
    badgePanelHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(8)
    },
    badgePanelTrophy: { width: s(16), height: s(14) },
    badgePanelTitle: {
      fontFamily: appFonts.accent,
      fontSize: t(14),
      letterSpacing: 0.6,
      color: figmaColors.brown
    },
    badgePanelRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(10)
    },
    badgePanelTextCol: { flex: 1, gap: s(10) },
    badgePanelBody: {
      fontFamily: appFonts.bodyBold,
      fontSize: t(12),
      lineHeight: t(17),
      color: figmaColors.brownMuted
    },
    badgePanelBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: s(8),
      alignSelf: 'flex-start',
      backgroundColor: figmaColors.surfaceElevated,
      borderWidth: 1,
      borderColor: figmaColors.borderStrong,
      paddingHorizontal: s(14),
      paddingVertical: s(9)
    },
    badgePanelBtnText: {
      fontFamily: appFonts.accent,
      fontSize: t(12),
      letterSpacing: 0.4,
      color: figmaColors.brownMuted
    },
    badgePanelBtnArrow: { width: s(9), height: s(9) },
    badgeCluster: {
      width: s(130),
      height: s(74)
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

    tileGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: s(8),
      justifyContent: 'flex-start',
      marginBottom: s(14)
    },

    sectionBox: {
      backgroundColor: figmaColors.cream,
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      borderRadius: s(9),
      paddingHorizontal: s(12),
      paddingVertical: s(10),
      marginBottom: s(12)
    },
    sectionBoxTitle: {
      fontFamily: appFonts.accent,
      fontSize: t(13),
      letterSpacing: 0.5,
      color: figmaColors.brown,
      marginBottom: s(4)
    },
    leadsHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    needRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(10),
      paddingVertical: s(10)
    },
    rowDividerTop: {
      borderTopWidth: 1,
      borderTopColor: figmaColors.divider
    },
    needIcon: { width: s(24), height: s(24) },
    needBody: { flex: 1, gap: s(1) },
    needTitle: {
      fontFamily: appFonts.bodyBold,
      fontSize: t(14),
      color: figmaColors.charcoal
    },
    needHint: {
      fontFamily: appFonts.body,
      fontSize: t(11),
      lineHeight: t(14),
      color: figmaColors.grayMuted
    },
    missingChip: {
      borderWidth: 1,
      borderColor: figmaColors.errorBorder,
      backgroundColor: figmaColors.errorBg,
      borderRadius: s(5),
      paddingHorizontal: s(7),
      paddingVertical: s(4)
    },
    missingChipText: {
      fontFamily: appFonts.accent,
      fontSize: t(9),
      letterSpacing: 0.4,
      color: figmaColors.error
    },
    statusChip: {
      borderWidth: 1,
      borderRadius: s(5),
      paddingHorizontal: s(7),
      paddingVertical: s(4)
    },
    statusChipText: {
      fontFamily: appFonts.accent,
      fontSize: t(9),
      letterSpacing: 0.4
    },
    seeAllLeads: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: s(8),
      borderWidth: 1,
      borderColor: figmaColors.borderStrong,
      backgroundColor: figmaColors.parchment,
      paddingVertical: s(8),
      marginTop: s(4)
    },
    seeAllLeadsText: {
      fontFamily: appFonts.accent,
      fontSize: t(11),
      letterSpacing: 0.4,
      color: figmaColors.brownMuted
    },
    seeAllLeadsArrow: { width: s(9), height: s(9) },

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

    stickyCta: {
      borderTopWidth: 2,
      borderTopColor: figmaColors.stone,
      backgroundColor: figmaColors.background,
      paddingHorizontal: s(16),
      paddingTop: s(10),
      paddingBottom: s(8),
      gap: s(8)
    },
    submitCta: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: s(12),
      backgroundColor: figmaColors.umber,
      borderWidth: 2,
      borderColor: figmaColors.sepia,
      borderRadius: s(12),
      paddingVertical: s(10)
    },
    submitCtaShield: { width: s(26), height: s(30) },
    submitCtaTitle: {
      fontFamily: appFonts.accent,
      fontSize: t(17),
      letterSpacing: 0.6,
      color: figmaColors.textOnDark,
      textAlign: 'center'
    },
    submitCtaSub: {
      fontFamily: appFonts.bodyBold,
      fontSize: t(10),
      letterSpacing: 0.5,
      color: figmaColors.taupeLight,
      textAlign: 'center'
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

    bottomBar: {
      flexDirection: 'row',
      alignItems: 'stretch',
      backgroundColor: figmaColors.cream,
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      borderRadius: s(8),
      paddingVertical: s(8),
      paddingHorizontal: s(6)
    },
    bottomBarItem: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: s(7)
    },
    bottomBarIcon: { width: s(15), height: s(15) },
    bottomBarLabel: {
      fontFamily: appFonts.accent,
      fontSize: t(11),
      letterSpacing: 0.4,
      color: figmaColors.brown
    },
    bottomBarSub: {
      fontFamily: appFonts.body,
      fontSize: t(9),
      color: figmaColors.grayMuted
    },
    bottomBarDivider: {
      width: 1,
      backgroundColor: figmaColors.borderLight,
      marginVertical: s(2)
    },

    error: {
      fontFamily: appFonts.body,
      fontSize: t(14),
      color: figmaColors.error
    }
  });
}
