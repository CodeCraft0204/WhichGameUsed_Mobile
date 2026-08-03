import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Linking,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CampaignProgressBar } from '@/components/advocacy/CampaignProgressBar';
import { ProfileSubpageHeader } from '@/components/profile/ProfileSubpageHeader';
import { advocacyCopy } from '@/constants/advocacyCopy';
import { appFonts } from '@/constants/appFonts';
import { bodyText } from '@/constants/appTypography';
import { figmaColors } from '@/constants/figmaColors';
import {
  advocacyHref,
  advocacySubmitEvidenceHref,
  authenticatedAssetHref,
  databaseCardHref,
  discussionThreadHref,
  educationTimelineHref,
  mostWantedDetailHref,
  mostWantedHref,
  safeGoBack
} from '@/constants/navigation';
import { useAuth } from '@/context/AuthContext';
import { useFigmaLayout } from '@/hooks/useFigmaLayout';
import * as LinkingExpo from 'expo-linking';
import {
  advocacyPrimaryCta,
  advocacyRelationTypeLabel,
  advocacyStatusLabel,
  advocacyTypeLabel,
  followAdvocacyInitiative,
  formatAdvocacyCount,
  getAdvocacyInitiative,
  groupAdvocacyRelationsByRole,
  primaryActionIsFollow,
  primaryActionIsReviewEvidence,
  supportAdvocacyInitiative,
  unfollowAdvocacyInitiative,
  withdrawAdvocacySupport,
  type AdvocacyInitiativeDetail,
  type AdvocacyRelationItem
} from '@/lib/advocacy';

export default function AdvocacyInitiativeDetailScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const params = useLocalSearchParams<{ id: string }>();
  const id = typeof params.id === 'string' ? params.id : '';
  const { s, t } = useFigmaLayout();
  const styles = useMemo(() => createStyles(s, t), [s, t]);
  const [initiative, setInitiative] = useState<AdvocacyInitiativeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandAffected, setExpandAffected] = useState(false);
  const evidenceY = useRef(0);
  const scrollRef = useRef<ScrollView>(null);

  const relationGroups = useMemo(
    () => groupAdvocacyRelationsByRole(initiative?.relations ?? []),
    [initiative?.relations]
  );
  const discussionRel = relationGroups.discussion[0] ?? null;

  function openRelation(rel: AdvocacyRelationItem) {
    switch (rel.relation_type) {
      case 'catalog_card':
        router.push(databaseCardHref(rel.relation_id));
        return;
      case 'authenticated_asset':
        router.push(authenticatedAssetHref(rel.relation_id));
        return;
      case 'most_wanted_hunt':
        router.push(mostWantedDetailHref(rel.relation_id));
        return;
      case 'education_publication':
        if (rel.href_hint) router.push(educationTimelineHref(rel.href_hint));
        return;
      case 'discussion_thread':
        router.push(discussionThreadHref(rel.relation_id));
        return;
      case 'external_source':
        if (rel.href_hint) void Linking.openURL(rel.href_hint);
        return;
      default:
        // memorabilia / product — title stub until mobile routes exist
        return;
    }
  }

  function relationPressable(rel: AdvocacyRelationItem) {
    // Hide memorabilia/product until dedicated mobile routes exist.
    if (rel.relation_type === 'memorabilia_piece' || rel.relation_type === 'product') {
      return (
        <View key={rel.id} style={styles.rowItem}>
          <Text style={styles.rowText}>
            {advocacyRelationTypeLabel(rel.relation_type)}: {rel.title}
          </Text>
        </View>
      );
    }
    const canOpen =
      rel.relation_type === 'catalog_card' ||
      rel.relation_type === 'authenticated_asset' ||
      rel.relation_type === 'most_wanted_hunt' ||
      rel.relation_type === 'discussion_thread' ||
      (rel.relation_type === 'education_publication' && Boolean(rel.href_hint)) ||
      (rel.relation_type === 'external_source' && Boolean(rel.href_hint));
    return (
      <Pressable
        key={rel.id}
        style={styles.rowItem}
        disabled={!canOpen}
        onPress={() => openRelation(rel)}
      >
        <Text style={canOpen ? styles.linkText : styles.rowText}>
          {advocacyRelationTypeLabel(rel.relation_type)}: {rel.title}
        </Text>
      </Pressable>
    );
  }

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    const { initiative: next, error: err } = await getAdvocacyInitiative(id);
    setInitiative(next);
    setError(err ?? (next ? null : 'Initiative not found.'));
    setLoading(false);
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  async function requireAuth(): Promise<boolean> {
    if (user) return true;
    router.push('/sign-in/sign-in');
    return false;
  }

  async function handlePrimary() {
    if (!initiative) return;
    if (!(await requireAuth())) return;

    if (primaryActionIsReviewEvidence(initiative.initiative_type)) {
      scrollRef.current?.scrollTo({ y: Math.max(0, evidenceY.current - 24), animated: true });
      return;
    }

    setBusy(true);
    if (primaryActionIsFollow(initiative.initiative_type)) {
      const { error: err } = initiative.viewer_is_following
        ? await unfollowAdvocacyInitiative(initiative.id)
        : await followAdvocacyInitiative(initiative.id);
      setBusy(false);
      if (err) setError(err);
      else await load();
      return;
    }

    if (initiative.viewer_has_supported) {
      const { error: err } = await withdrawAdvocacySupport(initiative.id);
      setBusy(false);
      if (err) setError(err);
      else await load();
      return;
    }

    const { error: err } = await supportAdvocacyInitiative(initiative.id);
    setBusy(false);
    if (err) setError(err);
    else await load();
  }

  async function toggleFollow() {
    if (!initiative || !(await requireAuth())) return;
    setBusy(true);
    const { error: err } = initiative.viewer_is_following
      ? await unfollowAdvocacyInitiative(initiative.id)
      : await followAdvocacyInitiative(initiative.id);
    setBusy(false);
    if (err) setError(err);
    else await load();
  }

  const primaryLabel = !initiative
    ? ''
    : !user
      ? advocacyCopy.signInToAct
      : primaryActionIsFollow(initiative.initiative_type)
        ? initiative.viewer_is_following
          ? advocacyCopy.unfollow
          : advocacyPrimaryCta(initiative.initiative_type)
        : primaryActionIsReviewEvidence(initiative.initiative_type)
          ? advocacyPrimaryCta(initiative.initiative_type)
          : initiative.viewer_has_supported
            ? advocacyCopy.withdraw
            : advocacyPrimaryCta(initiative.initiative_type);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ProfileSubpageHeader
        title="INITIATIVE"
        s={s}
        t={t}
        onBack={() => safeGoBack(advocacyHref())}
      />
      <ScrollView ref={scrollRef} contentContainerStyle={styles.content}>
        {loading ? (
          <ActivityIndicator color={figmaColors.charcoal} style={{ marginTop: s(40) }} />
        ) : null}
        {error && !initiative ? <Text style={styles.error}>{error}</Text> : null}
        {initiative ? (
          <>
            {initiative.cover_image_url ? (
              <Image
                source={{ uri: initiative.cover_image_url }}
                style={styles.hero}
                resizeMode="cover"
              />
            ) : null}
            <Text style={styles.meta}>
              {advocacyTypeLabel(initiative.initiative_type)} ·{' '}
              {advocacyStatusLabel(initiative.status)}
            </Text>
            <Text style={styles.title}>{initiative.title}</Text>
            {initiative.organization_name ? (
              <Text style={styles.org}>{initiative.organization_name}</Text>
            ) : null}

            <Text style={styles.metrics}>
              {formatAdvocacyCount(initiative.supporter_count)} supporters ·{' '}
              {formatAdvocacyCount(initiative.confirmed_evidence_count)} evidence ·{' '}
              {formatAdvocacyCount(initiative.follower_count)} followers ·{' '}
              {formatAdvocacyCount(initiative.update_count)} updates
            </Text>
            {initiative.progress != null ||
            (initiative.goal_count != null && initiative.goal_count > 0) ? (
              <CampaignProgressBar
                progress={initiative.progress}
                s={s}
                style={{ marginTop: s(8), marginBottom: s(4) }}
              />
            ) : null}

            {initiative.viewer_has_supported ? (
              <Text style={styles.you}>{advocacyCopy.youSupported}</Text>
            ) : null}
            {initiative.viewer_is_following ? (
              <Text style={styles.you}>{advocacyCopy.youFollowing}</Text>
            ) : null}

            <Pressable
              style={[styles.cta, busy && styles.ctaDisabled]}
              disabled={busy}
              onPress={() => void handlePrimary()}
            >
              <Text style={styles.ctaText}>{primaryLabel}</Text>
            </Pressable>

            <View style={styles.secondaryRow}>
              {!primaryActionIsFollow(initiative.initiative_type) ? (
                <Pressable style={styles.secondaryBtn} onPress={() => void toggleFollow()}>
                  <Text style={styles.secondaryText}>
                    {initiative.viewer_is_following
                      ? advocacyCopy.unfollow
                      : advocacyCopy.followUpdates}
                  </Text>
                </Pressable>
              ) : null}
              <Pressable
                style={styles.secondaryBtn}
                onPress={async () => {
                  if (!(await requireAuth())) return;
                  router.push(advocacySubmitEvidenceHref(initiative.id));
                }}
              >
                <Text style={styles.secondaryText}>{advocacyCopy.submitEvidence}</Text>
              </Pressable>
              {discussionRel ? (
                <Pressable
                  style={styles.secondaryBtn}
                  onPress={() => router.push(discussionThreadHref(discussionRel.relation_id))}
                >
                  <Text style={styles.secondaryText}>{advocacyCopy.joinDiscussion}</Text>
                </Pressable>
              ) : null}
              <Pressable
                style={styles.secondaryBtn}
                onPress={() => {
                  const deepLink = LinkingExpo.createURL(`/advocacy/${initiative.id}`);
                  void Share.share({
                    message: `${initiative.title} — Which Game Used Advocacy\n${deepLink}`,
                    url: deepLink
                  });
                }}
              >
                <Text style={styles.secondaryText}>{advocacyCopy.share}</Text>
              </Pressable>
            </View>

            {error ? <Text style={styles.error}>{error}</Text> : null}

            {(
              [
                [advocacyCopy.whatHappening, initiative.what_is_happening],
                [advocacyCopy.whyMatters, initiative.why_it_matters],
                [advocacyCopy.changeRequested, initiative.change_requested]
              ] as const
            ).map(([label, body]) =>
              body ? (
                <View key={label} style={styles.block}>
                  <Text style={styles.blockTitle}>{label}</Text>
                  <Text style={styles.blockBody}>{body}</Text>
                </View>
              ) : null
            )}

            <View
              style={styles.section}
              onLayout={(e) => {
                evidenceY.current = e.nativeEvent.layout.y;
              }}
            >
              <Text style={styles.sectionTitle}>{advocacyCopy.evidence}</Text>
              <Text style={styles.metrics}>
                {formatAdvocacyCount(initiative.confirmed_evidence_count)} confirmed evidence items
              </Text>
              {initiative.evidence
                .filter((e) => e.status === 'confirmed')
                .map((e) => (
                  <Pressable
                    key={e.id}
                    style={styles.rowItem}
                    onPress={() => {
                      if (e.url) void Linking.openURL(e.url);
                    }}
                  >
                    <Ionicons name="document-text-outline" size={s(18)} color={figmaColors.charcoal} />
                    <Text style={styles.rowText}>
                      {e.title} ({e.evidence_kind})
                    </Text>
                  </Pressable>
                ))}
            </View>

            {initiative.timeline.length > 0 ? (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>{advocacyCopy.timeline}</Text>
                {initiative.timeline.map((ev) => (
                  <Text key={ev.id} style={styles.rowText}>
                    · {ev.label}
                  </Text>
                ))}
              </View>
            ) : null}

            {initiative.updates.length > 0 ? (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>{advocacyCopy.updates}</Text>
                {initiative.updates.map((u) => (
                  <View key={u.id} style={styles.updateCard}>
                    <Text style={styles.updateTitle}>
                      {u.is_important ? '★ ' : ''}
                      {u.title}
                    </Text>
                    {u.body ? <Text style={styles.blockBody}>{u.body}</Text> : null}
                  </View>
                ))}
              </View>
            ) : null}

            {(initiative.relations?.length ?? 0) > 0 ? (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>{advocacyCopy.related}</Text>
                <Text style={styles.tip}>{advocacyCopy.mwVsAdvocacyTip}</Text>
                <Pressable onPress={() => router.push(mostWantedHref())}>
                  <Text style={styles.linkText}>Browse Most Wanted</Text>
                </Pressable>

                {relationGroups.primary_subject.length > 0 ? (
                  <View style={styles.relatedGroup}>
                    <Text style={styles.relatedLabel}>{advocacyCopy.relatedPrimary}</Text>
                    {relationGroups.primary_subject.map(relationPressable)}
                  </View>
                ) : null}

                {relationGroups.affected_item.length > 0 ? (
                  <View style={styles.relatedGroup}>
                    <Text style={styles.relatedLabel}>
                      {advocacyCopy.relatedAffected} ({relationGroups.affected_item.length})
                    </Text>
                    {(expandAffected
                      ? relationGroups.affected_item
                      : relationGroups.affected_item.slice(0, 3)
                    ).map(relationPressable)}
                    {relationGroups.affected_item.length > 3 ? (
                      <Pressable onPress={() => setExpandAffected((v) => !v)}>
                        <Text style={styles.linkText}>
                          {expandAffected
                            ? advocacyCopy.showFewerAffected
                            : advocacyCopy.showAllAffected}
                        </Text>
                      </Pressable>
                    ) : null}
                  </View>
                ) : null}

                {relationGroups.supporting_evidence.length > 0 ? (
                  <View style={styles.relatedGroup}>
                    <Text style={styles.relatedLabel}>{advocacyCopy.relatedEvidence}</Text>
                    {relationGroups.supporting_evidence.map(relationPressable)}
                  </View>
                ) : null}

                {relationGroups.related_research.length > 0 ? (
                  <View style={styles.relatedGroup}>
                    <Text style={styles.relatedLabel}>{advocacyCopy.relatedResearch}</Text>
                    {relationGroups.related_research.map(relationPressable)}
                  </View>
                ) : null}

                {relationGroups.discussion.length > 0 ? (
                  <View style={styles.relatedGroup}>
                    <Text style={styles.relatedLabel}>{advocacyCopy.relatedDiscussion}</Text>
                    {relationGroups.discussion.map(relationPressable)}
                  </View>
                ) : null}
              </View>
            ) : null}

            {(initiative.status === 'resolved' || initiative.status === 'closed') &&
            initiative.outcome_summary ? (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>{advocacyCopy.outcome}</Text>
                {initiative.outcome_type ? (
                  <Text style={styles.meta}>{initiative.outcome_type.toUpperCase()}</Text>
                ) : null}
                <Text style={styles.blockBody}>{initiative.outcome_summary}</Text>
                {initiative.lessons_learned ? (
                  <Text style={styles.blockBody}>Lessons: {initiative.lessons_learned}</Text>
                ) : null}
                {initiative.unresolved_questions ? (
                  <Text style={styles.blockBody}>
                    Open questions: {initiative.unresolved_questions}
                  </Text>
                ) : null}
              </View>
            ) : null}

            {initiative.sources.length > 0 ? (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>{advocacyCopy.sources}</Text>
                {initiative.sources.map((src) => (
                  <Pressable
                    key={src.id}
                    style={styles.rowItem}
                    onPress={() => {
                      if (src.url) void Linking.openURL(src.url);
                    }}
                  >
                    <Text style={styles.linkText}>{src.title}</Text>
                  </Pressable>
                ))}
              </View>
            ) : null}
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(s: (n: number) => number, t: (n: number) => number) {
  const tb = (n: number) => bodyText(t, n);
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: figmaColors.background },
    content: { padding: s(20), paddingBottom: s(48) },
    hero: { width: '100%', height: s(200), borderRadius: s(12), marginBottom: s(16) },
    meta: {
      fontFamily: appFonts.body,
      fontSize: tb(12),
      color: figmaColors.gray,
      marginBottom: s(6),
      letterSpacing: 0.8
    },
    title: {
      fontFamily: appFonts.body,
      fontSize: tb(28),
      lineHeight: tb(34),
      color: figmaColors.charcoal,
      marginBottom: s(6)
    },
    org: {
      fontFamily: appFonts.body,
      fontSize: tb(15),
      color: figmaColors.gray,
      marginBottom: s(10)
    },
    metrics: {
      fontFamily: appFonts.body,
      fontSize: tb(14),
      color: figmaColors.gray,
      marginBottom: s(10)
    },
    you: {
      fontFamily: appFonts.body,
      fontSize: tb(14),
      color: figmaColors.charcoal,
      marginBottom: s(6)
    },
    cta: {
      height: s(48),
      borderRadius: s(24),
      borderWidth: 1,
      borderColor: figmaColors.buttonPrimaryBorder,
      backgroundColor: figmaColors.buttonPrimaryBg,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: s(10)
    },
    ctaDisabled: { opacity: 0.45 },
    ctaText: {
      fontFamily: appFonts.body,
      fontSize: tb(15),
      color: figmaColors.buttonPrimaryText
    },
    secondaryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: s(8), marginBottom: s(16) },
    secondaryBtn: {
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      borderRadius: s(16),
      paddingHorizontal: s(12),
      paddingVertical: s(8)
    },
    secondaryText: {
      fontFamily: appFonts.body,
      fontSize: tb(12),
      color: figmaColors.charcoal
    },
    block: { marginBottom: s(16) },
    blockTitle: {
      fontFamily: appFonts.body,
      fontSize: tb(16),
      color: figmaColors.charcoal,
      marginBottom: s(6)
    },
    blockBody: {
      fontFamily: appFonts.body,
      fontSize: tb(16),
      lineHeight: tb(22),
      color: figmaColors.gray
    },
    section: { marginTop: s(12) },
    sectionTitle: {
      fontFamily: appFonts.body,
      fontSize: tb(13),
      color: figmaColors.gray,
      marginBottom: s(8),
      letterSpacing: 1
    },
    tip: {
      fontFamily: appFonts.body,
      fontSize: tb(13),
      lineHeight: tb(18),
      color: figmaColors.gray,
      marginBottom: s(10)
    },
    relatedGroup: { marginTop: s(10), marginBottom: s(4) },
    relatedLabel: {
      fontFamily: appFonts.body,
      fontSize: tb(12),
      color: figmaColors.gray,
      letterSpacing: 0.6,
      marginBottom: s(6)
    },
    rowItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(8),
      marginBottom: s(8)
    },
    rowText: {
      flex: 1,
      fontFamily: appFonts.body,
      fontSize: tb(15),
      color: figmaColors.charcoal,
      marginBottom: s(4)
    },
    linkText: {
      fontFamily: appFonts.body,
      fontSize: tb(15),
      color: figmaColors.charcoal,
      textDecorationLine: 'underline'
    },
    updateCard: {
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      borderRadius: s(12),
      padding: s(12),
      marginBottom: s(8),
      backgroundColor: figmaColors.cream
    },
    updateTitle: {
      fontFamily: appFonts.body,
      fontSize: tb(16),
      color: figmaColors.charcoal,
      marginBottom: s(4)
    },
    error: {
      fontFamily: appFonts.body,
      fontSize: tb(15),
      color: '#8B2E2E',
      marginVertical: s(8)
    }
  });
}
