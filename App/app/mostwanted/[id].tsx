import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { HuntCardImage } from '@/components/most-wanted/HuntCardImage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ProfileSubpageHeader } from '@/components/profile/ProfileSubpageHeader';
import { EvidenceChecklist } from '@/components/most-wanted/EvidenceChecklist';
import { EvidenceProgressMeter } from '@/components/most-wanted/EvidenceProgressMeter';
import { WantedStatusTagRow } from '@/components/most-wanted/WantedStatusTag';
import { appFonts } from '@/constants/appFonts';
import { mostWantedCopy } from '@/constants/mostWantedCopy';
import {
  databaseCardHref,
  discussionCreateHref,
  discussionThreadHref,
  mostWantedSubmitHref
} from '@/constants/navigation';
import { figmaColors } from '@/constants/figmaColors';
import { figmaIcons } from '@/constants/figmaIcons';
import { useAuth } from '@/context/AuthContext';
import { useFigmaLayout } from '@/hooks/useFigmaLayout';
import {
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
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (!id || typeof id !== 'string') return;
    setLoading(true);
    setError(null);
    const { detail: payload, error: err } = await getMostWantedDetail(id);
    setDetail(payload);
    setError(err);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const hunt = detail?.hunt;
  const fulfilled = detail?.requirements.filter((r) => r.is_fulfilled).length ?? 0;
  const total = detail?.requirements.length ?? 0;

  const handleShare = useCallback(async () => {
    if (!hunt) return;
    await Share.share({
      message: `Most Wanted: ${huntDisplayTitle(hunt)} — help find game-used evidence on Which Game Used.`
    });
  }, [hunt]);

  const handleWishlist = useCallback(async () => {
    if (!user || !hunt?.card_id) {
      setActionMessage('Watching this hunt instead.');
      if (!hunt) return;
      setWatchBusy(true);
      const { watching, error: watchError } = await toggleMostWantedWatch(hunt.id);
      setWatchBusy(false);
      if (watchError) setActionMessage(watchError);
      else {
        setActionMessage(watching ? 'Added to your watch list.' : 'Removed from watch list.');
        void reload();
      }
      return;
    }

    setWishlistBusy(true);
    const { error: wishError } = await addCardToWishlist(user.id, hunt.card_id);
    setWishlistBusy(false);
    setActionMessage(wishError ? wishError : 'Added to wishlist.');
  }, [hunt, reload, user]);

  const handleDiscuss = useCallback(() => {
    if (hunt?.forum_thread_id) {
      router.push(discussionThreadHref(hunt.forum_thread_id));
      return;
    }
    router.push(discussionCreateHref());
  }, [hunt?.forum_thread_id, router]);

  if (!id) {
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={styles.error}>Missing hunt id.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <ProfileSubpageHeader
          title="Wanted Hunt Detail"
          subtitle={hunt ? huntDisplayTitle(hunt) : undefined}
          s={s}
          t={t}
          onBack={() => router.back()}
        />

        {loading ? <ActivityIndicator color={figmaColors.charcoal} /> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}

        {hunt && detail ? (
          <>
            <View style={styles.heroCard}>
              <HuntCardImage
                coverImageUrl={hunt.cover_image_url}
                imageUrl={hunt.imageUrl}
                style={styles.heroImage}
              />
              <View style={styles.heroBody}>
                <Text style={styles.heroTitle}>{huntDisplayTitle(hunt)}</Text>
                <Text style={styles.meta}>
                  {[hunt.product_year, hunt.manufacturer_name ?? hunt.product_name, hunt.card_number ? `#${hunt.card_number}` : null]
                    .filter(Boolean)
                    .join(' · ')}
                </Text>
                <Text style={styles.meta}>
                  {[hunt.player_name, hunt.team_name, hunt.sport_slug].filter(Boolean).join(' · ')}
                </Text>
                {hunt.priority_tag === 'high_value' ? (
                  <View style={styles.priorityBadge}>
                    <Text style={styles.priorityText}>High Priority</Text>
                  </View>
                ) : null}
                <WantedStatusTagRow
                  tags={huntStatusTagsFromLabels(
                    detail.requirements.filter((r) => !r.is_fulfilled).map((r) => r.label),
                    hunt.status,
                    hunt.priority_tag
                  )}
                  s={s}
                  t={t}
                />
              </View>
            </View>

            {hunt.summary ? <Text style={styles.summary}>{hunt.summary}</Text> : null}

            <Text style={styles.sectionTitle}>{mostWantedCopy.detailWhatWeNeed}</Text>
            <EvidenceChecklist items={detail.requirements} s={s} t={t} />

            <Text style={styles.sectionTitle}>{mostWantedCopy.detailProgress}</Text>
            <Text style={styles.progressCopy}>{fulfilled} of {total} complete</Text>
            <EvidenceProgressMeter fulfilled={fulfilled} total={total} s={s} t={t} />

            <Text style={styles.sectionTitle}>{mostWantedCopy.detailReward}</Text>
            <View style={styles.rewardCard}>
              <Image source={figmaIcons.treasureChest} style={styles.rewardIcon} resizeMode="contain" />
              <Text style={styles.rewardText}>
                Reward: {formatRewardLabel(hunt.reward_amount_cents, hunt.reward_label)}
              </Text>
              <Text style={styles.rewardSub}>Contributor badge available</Text>
            </View>

            <Text style={styles.sectionTitle}>{mostWantedCopy.detailLeads}</Text>
            {detail.leads.length === 0 ? (
              <Text style={styles.muted}>No community leads yet. Be the first to contribute.</Text>
            ) : (
              detail.leads.map((lead) => (
                <View key={lead.id} style={styles.leadRow}>
                  <Text style={styles.leadText}>{leadSummary(lead)}</Text>
                  {lead.status === 'pending_review' ? (
                    <Text style={styles.leadPending}>Pending review</Text>
                  ) : null}
                </View>
              ))
            )}

            <View style={styles.actions}>
              <ActionButton label={mostWantedCopy.detailSubmit} onPress={() => router.push(mostWantedSubmitHref(hunt.id))} />
              <ActionButton
                label={detail.is_watching ? 'Watching' : mostWantedCopy.detailWishlist}
                onPress={() => void handleWishlist()}
                disabled={wishlistBusy || watchBusy}
              />
              <ActionButton label={mostWantedCopy.detailDiscuss} onPress={handleDiscuss} />
              <ActionButton label={mostWantedCopy.detailShare} onPress={() => void handleShare()} />
              {hunt.card_id ? (
                <ActionButton label="View Catalog Card" onPress={() => router.push(databaseCardHref(hunt.card_id!))} />
              ) : null}
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
  onPress,
  disabled
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [{ opacity: pressed || disabled ? 0.7 : 1 }]}
    >
      <View style={{
        borderWidth: 1,
        borderColor: figmaColors.borderLight,
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 14,
        backgroundColor: figmaColors.cream,
        marginBottom: 8
      }}>
        <Text style={{ fontFamily: appFonts.body, fontSize: 15, color: figmaColors.charcoal, textAlign: 'center' }}>
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

function createStyles(s: (n: number) => number, t: (n: number) => number) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: figmaColors.background },
    content: { paddingHorizontal: s(20), paddingBottom: s(32) },
    heroCard: {
      flexDirection: 'row',
      gap: s(12),
      backgroundColor: figmaColors.cream,
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      borderRadius: s(12),
      padding: s(12),
      marginBottom: s(16)
    },
    heroImage: { width: s(110), height: s(130) },
    heroBody: { flex: 1, gap: s(6) },
    heroTitle: {
      fontFamily: appFonts.body,
      fontSize: t(18),
      lineHeight: t(22),
      color: figmaColors.charcoal
    },
    meta: {
      fontFamily: appFonts.body,
      fontSize: t(13),
      color: figmaColors.gray
    },
    priorityBadge: {
      alignSelf: 'flex-start',
      backgroundColor: figmaColors.surfaceHighlight,
      borderRadius: s(6),
      paddingHorizontal: s(8),
      paddingVertical: s(4),
      borderWidth: 1,
      borderColor: figmaColors.accent
    },
    priorityText: {
      fontFamily: appFonts.body,
      fontSize: t(11),
      color: figmaColors.charcoal
    },
    summary: {
      fontFamily: appFonts.body,
      fontSize: t(14),
      lineHeight: t(20),
      color: figmaColors.gray,
      marginBottom: s(16)
    },
    sectionTitle: {
      fontFamily: appFonts.accent,
      fontSize: t(16),
      color: figmaColors.charcoal,
      marginTop: s(12),
      marginBottom: s(8)
    },
    progressCopy: {
      fontFamily: appFonts.body,
      fontSize: t(14),
      color: figmaColors.gray,
      marginBottom: s(6)
    },
    rewardCard: {
      backgroundColor: figmaColors.tagBg,
      borderRadius: s(10),
      padding: s(12),
      gap: s(4),
      marginBottom: s(8)
    },
    rewardIcon: { width: s(20), height: s(20) },
    rewardText: {
      fontFamily: appFonts.body,
      fontSize: t(15),
      color: figmaColors.charcoal
    },
    rewardSub: {
      fontFamily: appFonts.body,
      fontSize: t(12),
      color: figmaColors.gray
    },
    leadRow: {
      borderBottomWidth: 1,
      borderBottomColor: figmaColors.borderLight,
      paddingVertical: s(8)
    },
    leadText: {
      fontFamily: appFonts.body,
      fontSize: t(14),
      color: figmaColors.charcoal
    },
    leadPending: {
      fontFamily: appFonts.body,
      fontSize: t(11),
      color: figmaColors.gray,
      marginTop: s(2)
    },
    muted: {
      fontFamily: appFonts.body,
      fontSize: t(13),
      color: figmaColors.gray,
      marginBottom: s(8)
    },
    actions: { marginTop: s(16) },
    actionMessage: {
      fontFamily: appFonts.body,
      fontSize: t(13),
      color: figmaColors.accent,
      marginTop: s(8)
    },
    error: {
      fontFamily: appFonts.body,
      fontSize: t(14),
      color: figmaColors.accent
    }
  });
}
