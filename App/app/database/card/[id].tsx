import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AuthPrimaryButton } from '@/components/auth/AuthPrimaryButton';
import { CardImagePager } from '@/components/database/CardImagePager';
import { CardActionShortcut } from '@/components/database/card-detail/CardActionShortcut';
import { CardDetailTopBar } from '@/components/database/card-detail/CardDetailTopBar';
import { CardMetaRow } from '@/components/database/card-detail/CardMetaRow';
import { EvidenceConfidencePanel } from '@/components/database/card-detail/EvidenceConfidencePanel';
import { SectionPanel } from '@/components/database/card-detail/SectionPanel';
import { DatabaseRecordCard } from '@/components/figma/DatabaseRecordCard';
import { cardDetailCopy } from '@/constants/cardDetailCopy';
import { databaseIcons } from '@/constants/databaseContent';
import type { DatabaseMetaIconKey } from '@/constants/databaseContent';
import { databaseCopy } from '@/constants/databaseCopy';
import { appFonts } from '@/constants/appFonts';
import { bodyText } from '@/constants/appTypography';
import { figmaColors } from '@/constants/figmaColors';
import {
  authenticatedAssetHref,
  createWithLinkedCardHref,
  databaseCardHref,
  databaseSearchHref,
  discussionThreadHref
} from '@/constants/navigation';
import { useAuth } from '@/context/AuthContext';
import { useFigmaLayout } from '@/hooks/useFigmaLayout';
import {
  cardDescription,
  cardToTags,
  getCardById,
  listAuthenticatedAssetsForCard,
  listCatalogCards,
  type AuthenticatedAssetSummary,
  type CardDetail,
  type CardSummary
} from '@/lib/cards';
import {
  getCardResearchRatings,
  setUserResearchRating,
  type CardResearchRatings
} from '@/lib/card-research-ratings';
import { listForumThreads, type ForumThreadSummary } from '@/lib/forum';
import {
  addCardToWishlist,
  getWishlistEntryForCard,
  removeWishlistByCardId
} from '@/lib/wishlist';

type SectionKey = 'evidence' | 'history' | 'discussion';

function sportIcon(sport: string | null | undefined): DatabaseMetaIconKey {
  if (!sport) return 'baseball';
  const s = sport.toLowerCase();
  if (s.includes('basket')) return 'basketball';
  return 'baseball';
}

function cardToMeta(card: CardSummary) {
  const items: Array<{ icon: DatabaseMetaIconKey; label: string; value: string }> = [];
  if (card.player_name) items.push({ icon: 'person', label: databaseCopy.player, value: card.player_name });
  if (card.team_name) {
    items.push({ icon: sportIcon(card.sport_name), label: databaseCopy.team, value: card.team_name });
  }
  if (card.year) items.push({ icon: 'calendar', label: databaseCopy.year, value: String(card.year) });
  if (card.card_number) {
    items.push({ icon: 'shield', label: databaseCopy.cardNumber, value: card.card_number });
  }
  const setName = card.product_full_name ?? card.product_name;
  if (setName) items.push({ icon: 'person', label: databaseCopy.product, value: setName });
  return items;
}

function DetailRow({
  label,
  value,
  styles
}: {
  label: string;
  value: string | null | undefined;
  styles: ReturnType<typeof createStyles>;
}) {
  if (!value?.trim()) return null;
  return (
    <View style={styles.detailRow}>
      <View style={styles.detailDivider} />
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

export default function CardDetailScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { s, t } = useFigmaLayout();
  const styles = useMemo(() => createStyles(s, t), [s, t]);
  const scrollRef = useRef<ScrollView>(null);
  const sectionY = useRef<Partial<Record<SectionKey, number>>>({});

  const [card, setCard] = useState<CardDetail | null>(null);
  const [assets, setAssets] = useState<AuthenticatedAssetSummary[]>([]);
  const [related, setRelated] = useState<CardSummary[]>([]);
  const [threads, setThreads] = useState<ForumThreadSummary[]>([]);
  const [onWishlist, setOnWishlist] = useState(false);
  const [wishBusy, setWishBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [researchRatings, setResearchRatings] = useState<CardResearchRatings | null>(null);
  const [ratingBusy, setRatingBusy] = useState(false);

  useEffect(() => {
    if (!id || typeof id !== 'string') return;
    let active = true;
    setLoading(true);

    void Promise.all([
      getCardById(id),
      listAuthenticatedAssetsForCard(id),
      getWishlistEntryForCard(id),
      getCardResearchRatings(id),
      listForumThreads({ limit: 3, sort: 'newest' })
    ]).then(async ([cardResult, assetsResult, wishEntry, ratingsResult, forumResult]) => {
      if (!active) return;

      const loadedCard = cardResult.card;
      let relatedItems: CardSummary[] = [];
      if (loadedCard) {
        const query = loadedCard.player_name ?? loadedCard.title;
        const relatedResult = await listCatalogCards({ query, limit: 8 });
        relatedItems = relatedResult.items.filter((c) => c.id !== loadedCard.id).slice(0, 6);
      }

      if (!active) return;
      setCard(loadedCard);
      setAssets(assetsResult.items);
      setRelated(relatedItems);
      setThreads(forumResult.items);
      setOnWishlist(!!wishEntry.itemId);
      setResearchRatings(ratingsResult.ratings);
      setError(
        cardResult.error ??
          assetsResult.error ??
          wishEntry.error ??
          ratingsResult.error ??
          forumResult.error
      );
      setLoading(false);
    });

    return () => {
      active = false;
    };
  }, [id]);

  const scrollToSection = useCallback((key: SectionKey) => {
    const y = sectionY.current[key];
    if (y != null) scrollRef.current?.scrollTo({ y: Math.max(0, y - s(12)), animated: true });
  }, [s]);

  const registerSection = useCallback((key: SectionKey, y: number) => {
    sectionY.current[key] = y;
  }, []);

  const toggleWishlist = async () => {
    if (!user) {
      router.replace('/sign-in/sign-in');
      return;
    }
    if (!card || wishBusy) return;
    setWishBusy(true);
    if (onWishlist) {
      const { error: wishError } = await removeWishlistByCardId(card.id);
      setWishBusy(false);
      if (!wishError) setOnWishlist(false);
      return;
    }
    const { error: wishError } = await addCardToWishlist(user.id, card.id);
    setWishBusy(false);
    if (!wishError) setOnWishlist(true);
  };

  const voteResearch = async (rating: number) => {
    if (!user || !id || ratingBusy) return;
    setRatingBusy(true);
    const { error: voteError } = await setUserResearchRating(id, rating);
    if (!voteError) {
      const { ratings } = await getCardResearchRatings(id);
      setResearchRatings(ratings);
    }
    setRatingBusy(false);
  };

  const shareCard = async () => {
    if (!card) return;
    try {
      await Share.share({ message: cardDetailCopy.shareMessage(card.title) });
    } catch {
      // User dismissed share sheet
    }
  };

  const subtitle = card?.product_full_name ?? card?.product_name ?? undefined;
  const isAuthenticated = (card?.authenticated_count ?? 0) > 0;
  const hasFrontImage = !!card?.imageUrl;
  const hasBackImage = !!card?.backImageUrl;
  const heroMeta = card ? cardToMeta(card) : [];

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <CardDetailTopBar
          onBack={() => router.back()}
          onShare={card ? () => void shareCard() : undefined}
          onBookmark={card ? () => void toggleWishlist() : undefined}
          bookmarked={onWishlist}
          bookmarkBusy={wishBusy}
          s={s}
          t={t}
        />

        {loading ? <ActivityIndicator color={figmaColors.charcoal} style={styles.loader} /> : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}

        {card ? (
          <>
            <View style={styles.heroCard}>
              <View style={styles.imageWrap}>
                <CardImagePager
                  frontSource={
                    hasFrontImage ? { uri: card.imageUrl! } : databaseIcons.cardPlaceholder
                  }
                  backSource={
                    hasBackImage ? { uri: card.backImageUrl! } : databaseIcons.cardPlaceholder
                  }
                  hasFrontImage={hasFrontImage}
                  hasBackImage={hasBackImage}
                  s={s}
                  t={t}
                />
                <View
                  style={[
                    styles.statusBadge,
                    isAuthenticated ? styles.statusAuth : styles.statusUnauth
                  ]}
                >
                  <Ionicons
                    name={isAuthenticated ? 'shield-checkmark' : 'help-circle-outline'}
                    size={s(14)}
                    color={isAuthenticated ? figmaColors.success : figmaColors.brown}
                  />
                  <Text
                    style={[
                      styles.statusText,
                      isAuthenticated ? styles.statusTextAuth : styles.statusTextUnauth
                    ]}
                  >
                    {isAuthenticated ? cardDetailCopy.authenticated : cardDetailCopy.unauthenticated}
                  </Text>
                </View>
              </View>

              <Text style={styles.cardTitle}>{card.title}</Text>
              {subtitle ? <Text style={styles.cardSubtitle}>{subtitle}</Text> : null}

              {heroMeta.length > 0 ? (
                <View style={styles.metaBlock}>
                  {heroMeta.map((row) => (
                    <CardMetaRow
                      key={`${row.label}-${row.value}`}
                      icon={row.icon}
                      label={row.label}
                      value={row.value}
                      s={s}
                      t={t}
                    />
                  ))}
                </View>
              ) : null}

              <View style={styles.tagRow}>
                {card.sport_name ? (
                  <View style={styles.tag}>
                    <Text style={styles.tagText}>{card.sport_name.toUpperCase()}</Text>
                  </View>
                ) : null}
                {card.memorabilia_type ? (
                  <View style={styles.tag}>
                    <Text style={styles.tagText}>{card.memorabilia_type.toUpperCase()}</Text>
                  </View>
                ) : null}
              </View>
            </View>

            {researchRatings ? (
              <EvidenceConfidencePanel
                ratings={researchRatings}
                signedIn={!!user}
                voteBusy={ratingBusy}
                onVote={(rating) => void voteResearch(rating)}
                s={s}
                t={t}
              />
            ) : null}

            <View style={styles.actionRow}>
              <CardActionShortcut
                icon="document-text-outline"
                label={cardDetailCopy.actionEvidence}
                onPress={() => scrollToSection('evidence')}
                s={s}
                t={t}
              />
              <CardActionShortcut
                icon="git-compare-outline"
                label={cardDetailCopy.actionCompare}
                onPress={() =>
                  router.push(
                    databaseSearchHref({
                      q: card.player_name ?? card.title,
                      sport: card.sport_name?.toUpperCase()
                    })
                  )
                }
                s={s}
                t={t}
              />
              <CardActionShortcut
                icon="chatbubbles-outline"
                label={cardDetailCopy.actionDiscussion}
                onPress={() => scrollToSection('discussion')}
                s={s}
                t={t}
              />
              <CardActionShortcut
                icon="time-outline"
                label={cardDetailCopy.actionHistory}
                onPress={() => scrollToSection('history')}
                s={s}
                t={t}
              />
            </View>

            <View style={styles.primaryActions}>
              <AuthPrimaryButton
                label={onWishlist ? databaseCopy.removeFromWishlist : databaseCopy.addToWishlist}
                onPress={() => void toggleWishlist()}
                disabled={wishBusy}
              />
              <Pressable
                style={styles.secondaryBtn}
                onPress={() => router.push(createWithLinkedCardHref(card.id, card.title))}
              >
                <Ionicons name="scan-outline" size={s(18)} color={figmaColors.charcoal} />
                <Text style={styles.secondaryBtnText}>{databaseCopy.authenticateSimilar}</Text>
              </Pressable>
            </View>

            <SectionPanel title={cardDetailCopy.cardInformation} s={s} t={t}>
              <DetailRow label={databaseCopy.player} value={card.player_name} styles={styles} />
              <DetailRow label={databaseCopy.team} value={card.team_name} styles={styles} />
              <DetailRow
                label={databaseCopy.year}
                value={card.year ? String(card.year) : null}
                styles={styles}
              />
              <DetailRow label={databaseCopy.sport} value={card.sport_name} styles={styles} />
              <DetailRow label={databaseCopy.manufacturer} value={card.manufacturer_name} styles={styles} />
              <DetailRow
                label={databaseCopy.product}
                value={card.product_full_name ?? card.product_name}
                styles={styles}
              />
              <DetailRow label={databaseCopy.cardNumber} value={card.card_number} styles={styles} />
              <DetailRow label={databaseCopy.memorabilia} value={card.memorabilia_type} styles={styles} />
              <DetailRow
                label={databaseCopy.status}
                value={databaseCopy.authCount(card.authenticated_count)}
                styles={styles}
              />
            </SectionPanel>

            <SectionPanel title={cardDetailCopy.provenance} s={s} t={t}>
              <View style={styles.provenanceRow}>
                <Ionicons name="library-outline" size={s(18)} color={figmaColors.bronze} />
                <View style={styles.provenanceBody}>
                  <Text style={styles.provenanceLabel}>{cardDetailCopy.sourceCatalog}</Text>
                  <Text style={styles.provenanceValue}>
                    {card.manufacturer_name ?? '—'}
                    {card.published_at
                      ? ` · Published ${new Date(card.published_at).toLocaleDateString()}`
                      : ''}
                  </Text>
                </View>
              </View>
              <View style={styles.provenanceRow}>
                <Ionicons name="shield-checkmark-outline" size={s(18)} color={figmaColors.bronze} />
                <View style={styles.provenanceBody}>
                  <Text style={styles.provenanceLabel}>{cardDetailCopy.sourceAuthenticated}</Text>
                  <Text style={styles.provenanceValue}>
                    {databaseCopy.authCount(card.authenticated_count)}
                  </Text>
                </View>
              </View>
              {card.published_at ? (
                <View style={styles.provenanceRow}>
                  <Ionicons name="newspaper-outline" size={s(18)} color={figmaColors.bronze} />
                  <View style={styles.provenanceBody}>
                    <Text style={styles.provenanceLabel}>{cardDetailCopy.sourcePublished}</Text>
                    <Text style={styles.provenanceValue}>
                      {new Date(card.published_at).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
              ) : null}
            </SectionPanel>

            <View
              onLayout={(e) => {
                registerSection('evidence', e.nativeEvent.layout.y);
                registerSection('history', e.nativeEvent.layout.y);
              }}
            >
              <SectionPanel title={cardDetailCopy.evidenceHighlights} s={s} t={t}>
                {assets.length === 0 ? (
                  <Text style={styles.empty}>{databaseCopy.noAuthenticatedCopies}</Text>
                ) : (
                  assets.map((asset) => (
                    <Pressable
                      key={asset.id}
                      style={styles.assetRow}
                      onPress={() => router.push(authenticatedAssetHref(asset.id))}
                    >
                      <View style={styles.assetIcon}>
                        <Ionicons name="document-attach-outline" size={s(20)} color={figmaColors.bronze} />
                      </View>
                      <View style={styles.assetBody}>
                        <Text style={styles.assetId}>
                          {databaseCopy.assetId}: {asset.asset_id}
                        </Text>
                        <Text style={styles.assetDate}>
                          {asset.authenticated_at
                            ? new Date(asset.authenticated_at).toLocaleDateString()
                            : '—'}
                        </Text>
                      </View>
                      <Text style={styles.assetLink}>{databaseCopy.viewVerification}</Text>
                    </Pressable>
                  ))
                )}
              </SectionPanel>
            </View>

            <SectionPanel title={cardDetailCopy.relatedCards} s={s} t={t}>
              {related.length === 0 ? (
                <Text style={styles.empty}>{cardDetailCopy.noRelated}</Text>
              ) : (
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.relatedRow}>
                    {related.map((item) => (
                      <View key={item.id} style={styles.relatedCard}>
                        <DatabaseRecordCard
                          imageUrl={item.imageUrl}
                          title={item.title}
                          description={cardDescription(item)}
                          tags={cardToTags(item)}
                          meta={cardToMeta(item).map((m) => ({
                            key: m.label,
                            icon: m.icon,
                            label: m.value
                          }))}
                          variant="recent"
                          onPress={() => router.push(databaseCardHref(item.id))}
                          s={s}
                          t={t}
                        />
                      </View>
                    ))}
                  </View>
                </ScrollView>
              )}
            </SectionPanel>

            <View onLayout={(e) => registerSection('discussion', e.nativeEvent.layout.y)}>
              <SectionPanel title={cardDetailCopy.discussionPreview} s={s} t={t}>
                {threads.length === 0 ? (
                  <Text style={styles.empty}>{cardDetailCopy.noDiscussion}</Text>
                ) : (
                  threads.map((thread) => (
                    <Pressable
                      key={thread.id}
                      style={styles.threadRow}
                      onPress={() => router.push(discussionThreadHref(thread.id))}
                    >
                      <Text style={styles.threadTitle} numberOfLines={2}>
                        {thread.title}
                      </Text>
                      <Text style={styles.threadMeta} numberOfLines={1}>
                        {thread.topic_title}
                        {thread.author_display_name || thread.author_username
                          ? ` · ${thread.author_display_name ?? thread.author_username}`
                          : ''}
                      </Text>
                    </Pressable>
                  ))
                )}
                <Pressable
                  style={styles.discussionCta}
                  onPress={() => router.push('/discussion/discussion')}
                >
                  <Text style={styles.discussionCtaText}>{cardDetailCopy.viewDiscussion}</Text>
                  <Ionicons name="arrow-forward" size={s(16)} color={figmaColors.bronze} />
                </Pressable>
              </SectionPanel>
            </View>
          </>
        ) : !loading ? (
          <Text style={styles.empty}>{databaseCopy.recentEmpty}</Text>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(s: (n: number) => number, t: (n: number) => number) {
  const tb = (n: number) => bodyText(t, n);

  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: figmaColors.background },
    content: { paddingHorizontal: s(16), paddingBottom: s(40) },
    loader: { marginVertical: s(24) },
    error: {
      fontFamily: appFonts.body,
      fontSize: tb(15),
      color: figmaColors.error,
      marginBottom: s(12)
    },
    heroCard: {
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      borderRadius: s(16),
      padding: s(16),
      marginBottom: s(20),
      backgroundColor: figmaColors.cream,
      shadowColor: figmaColors.black,
      shadowOffset: { width: 0, height: s(3) },
      shadowOpacity: 0.07,
      shadowRadius: s(8),
      elevation: 3
    },
    imageWrap: { position: 'relative', marginBottom: s(4) },
    statusBadge: {
      position: 'absolute',
      top: s(8),
      right: s(8),
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(4),
      borderRadius: s(20),
      paddingHorizontal: s(10),
      paddingVertical: s(6),
      borderWidth: 1
    },
    statusAuth: {
      backgroundColor: figmaColors.successBg,
      borderColor: figmaColors.success
    },
    statusUnauth: {
      backgroundColor: figmaColors.tagBg,
      borderColor: figmaColors.borderLight
    },
    statusText: {
      fontFamily: appFonts.accent,
      fontSize: tb(10),
      letterSpacing: 0.8
    },
    statusTextAuth: { color: figmaColors.success },
    statusTextUnauth: { color: figmaColors.brown },
    cardTitle: {
      fontFamily: appFonts.display,
      fontSize: t(28),
      lineHeight: t(34),
      color: figmaColors.charcoal,
      marginTop: s(8)
    },
    cardSubtitle: {
      marginTop: s(6),
      fontFamily: appFonts.body,
      fontSize: tb(17),
      lineHeight: tb(24),
      color: figmaColors.textSecondary
    },
    metaBlock: {
      marginTop: s(12),
      borderTopWidth: 1,
      borderTopColor: figmaColors.divider,
      paddingTop: s(4)
    },
    tagRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: s(8),
      marginTop: s(12)
    },
    tag: {
      backgroundColor: figmaColors.tagBg,
      borderWidth: 1,
      borderColor: figmaColors.tagBorder,
      borderRadius: s(8),
      paddingHorizontal: s(10),
      paddingVertical: s(6)
    },
    tagText: {
      fontFamily: appFonts.body,
      fontSize: tb(11),
      color: figmaColors.gray
    },
    actionRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: s(8),
      marginBottom: s(20)
    },
    primaryActions: { gap: s(10), marginBottom: s(8) },
    secondaryBtn: {
      minHeight: s(48),
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      borderRadius: s(12),
      backgroundColor: figmaColors.cream,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: s(8)
    },
    secondaryBtnText: {
      fontFamily: appFonts.accent,
      fontSize: tb(16),
      color: figmaColors.charcoal,
      letterSpacing: 0.8
    },
    detailRow: { paddingVertical: s(8) },
    detailDivider: {
      height: 1,
      backgroundColor: figmaColors.divider,
      marginBottom: s(8)
    },
    detailLabel: {
      fontFamily: appFonts.accent,
      fontSize: tb(11),
      color: figmaColors.gray,
      marginBottom: s(4),
      letterSpacing: 0.8,
      textTransform: 'uppercase'
    },
    detailValue: {
      fontFamily: appFonts.body,
      fontSize: tb(17),
      lineHeight: tb(24),
      color: figmaColors.charcoal
    },
    provenanceRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: s(12),
      paddingVertical: s(10)
    },
    provenanceBody: { flex: 1, minWidth: 0 },
    provenanceLabel: {
      fontFamily: appFonts.accent,
      fontSize: tb(11),
      color: figmaColors.gray,
      letterSpacing: 0.8,
      textTransform: 'uppercase',
      marginBottom: s(4)
    },
    provenanceValue: {
      fontFamily: appFonts.body,
      fontSize: tb(16),
      lineHeight: tb(22),
      color: figmaColors.charcoal
    },
    empty: {
      fontFamily: appFonts.body,
      fontSize: tb(16),
      lineHeight: tb(22),
      color: figmaColors.textMuted
    },
    assetRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(12),
      borderWidth: 1,
      borderColor: figmaColors.divider,
      borderRadius: s(12),
      padding: s(12),
      marginBottom: s(8),
      backgroundColor: figmaColors.creamLight
    },
    assetIcon: {
      width: s(40),
      height: s(40),
      borderRadius: s(20),
      backgroundColor: figmaColors.tagBg,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: figmaColors.borderLight
    },
    assetBody: { flex: 1, minWidth: 0 },
    assetId: {
      fontFamily: appFonts.body,
      fontSize: tb(16),
      color: figmaColors.charcoal
    },
    assetDate: {
      fontFamily: appFonts.body,
      fontSize: tb(14),
      color: figmaColors.textMuted,
      marginTop: s(2)
    },
    assetLink: {
      fontFamily: appFonts.body,
      fontSize: tb(14),
      color: figmaColors.bronze
    },
    relatedRow: { flexDirection: 'row', gap: s(12), paddingVertical: s(4) },
    relatedCard: { width: s(280) },
    threadRow: {
      borderBottomWidth: 1,
      borderBottomColor: figmaColors.divider,
      paddingVertical: s(12)
    },
    threadTitle: {
      fontFamily: appFonts.body,
      fontSize: tb(16),
      lineHeight: tb(22),
      color: figmaColors.charcoal
    },
    threadMeta: {
      fontFamily: appFonts.body,
      fontSize: tb(13),
      color: figmaColors.textMuted,
      marginTop: s(4)
    },
    discussionCta: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: s(6),
      marginTop: s(12),
      paddingVertical: s(10)
    },
    discussionCtaText: {
      fontFamily: appFonts.accent,
      fontSize: tb(14),
      color: figmaColors.bronze,
      letterSpacing: 0.8
    }
  });
}
