import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ProfileSubpageHeader } from '@/components/profile/ProfileSubpageHeader';
import { appFonts } from '@/constants/appFonts';
import { databaseCopy } from '@/constants/databaseCopy';
import { figmaColors } from '@/constants/figmaColors';
import { mostWantedIcons } from '@/constants/mostWantedContent';
import {
  createWithLinkedCardHref,
  databaseCardHref,
  databaseWishlistHref,
  mostWantedDetailHref
} from '@/constants/navigation';
import { useFigmaLayout } from '@/hooks/useFigmaLayout';
import {
  getWishlistItemEnriched,
  removeWishlistItem,
  type WishlistDisplayStatus,
  type WishlistEnrichedItem
} from '@/lib/wishlist';

function statusLabel(status: WishlistDisplayStatus): string {
  switch (status) {
    case 'saved':
      return databaseCopy.wishlistStatusSaved;
    case 'requested':
      return databaseCopy.wishlistStatusRequested;
    case 'under_review':
      return databaseCopy.wishlistStatusUnderReview;
    case 'promoted_to_most_wanted':
      return databaseCopy.wishlistStatusPromoted;
    case 'evidence_needed':
      return databaseCopy.wishlistStatusEvidenceNeeded;
    case 'added_to_database':
      return databaseCopy.wishlistStatusAdded;
    default:
      return status;
  }
}

function statusStory(status: WishlistDisplayStatus): string {
  switch (status) {
    case 'saved':
      return databaseCopy.wishlistStorySaved;
    case 'requested':
      return databaseCopy.wishlistStoryRequested;
    case 'under_review':
      return databaseCopy.wishlistStoryUnderReview;
    case 'promoted_to_most_wanted':
      return databaseCopy.wishlistStoryPromoted;
    case 'evidence_needed':
      return databaseCopy.wishlistStoryEvidence;
    case 'added_to_database':
      return databaseCopy.wishlistStoryAdded;
    default:
      return '';
  }
}

/** Pipeline position for the journey meter (0-based stage index). */
const JOURNEY_STAGES = ['Saved', 'Requested', 'In Review', 'Most Wanted', 'In Database'] as const;

function journeyIndex(status: WishlistDisplayStatus): number {
  switch (status) {
    case 'saved':
      return 0;
    case 'requested':
      return 1;
    case 'under_review':
      return 2;
    case 'promoted_to_most_wanted':
    case 'evidence_needed':
      return 3;
    case 'added_to_database':
      return 4;
    default:
      return 0;
  }
}

export default function WishlistDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { s, t } = useFigmaLayout();
  const styles = useMemo(() => createStyles(s, t), [s, t]);
  const [item, setItem] = useState<WishlistEnrichedItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const reload = useCallback(() => {
    if (!id) {
      setError('Item not found.');
      setLoading(false);
      return;
    }
    setLoading(true);
    void getWishlistItemEnriched(id).then(({ item: row, error: err }) => {
      setItem(row);
      setError(err ?? (row ? null : 'Item not found.'));
      setLoading(false);
    });
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload])
  );

  const handleRemove = async () => {
    if (!item) return;
    setBusy(true);
    const { error: err } = await removeWishlistItem(item.id);
    setBusy(false);
    if (err) {
      setError(err);
      return;
    }
    router.replace(databaseWishlistHref());
  };

  const catalogId = item?.catalog_card_id ?? null;
  const canAuth = !!catalogId;
  const canViewMw =
    !!item?.most_wanted_hunt_id &&
    (item.display_status === 'promoted_to_most_wanted' ||
      item.display_status === 'evidence_needed' ||
      item.most_wanted_status === 'solved');
  const canViewCard = !!catalogId;

  const primaryCta = (() => {
    if (!item) return null;
    if (canViewMw && item.most_wanted_hunt_id) {
      return {
        label: databaseCopy.wishlistCtaViewMostWanted,
        sub: 'HELP COMPLETE THIS CARD',
        onPress: () => router.push(mostWantedDetailHref(item.most_wanted_hunt_id!))
      };
    }
    if (canViewCard && item.display_status === 'added_to_database') {
      return {
        label: databaseCopy.wishlistCtaViewCard,
        sub: 'NOW IN THE DATABASE',
        onPress: () => router.push(databaseCardHref(catalogId!))
      };
    }
    if (canAuth) {
      return {
        label: databaseCopy.wishlistCtaAuthenticate,
        sub: 'START A CASE FILE',
        onPress: () => router.push(createWithLinkedCardHref(catalogId!, item.card_title))
      };
    }
    return null;
  })();

  const stageIndex = item ? journeyIndex(item.display_status) : 0;
  const journeyPct = Math.round((stageIndex / (JOURNEY_STAGES.length - 1)) * 100);
  const meta = item
    ? [item.player_name, item.product_year, item.product_name].filter(Boolean).join(' • ')
    : '';

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content}>
        <ProfileSubpageHeader
          title={databaseCopy.wishlistDetailTitle}
          s={s}
          t={t}
          onBack={() => router.back()}
        />

        {loading ? (
          <ActivityIndicator color={figmaColors.charcoal} style={{ marginVertical: s(24) }} />
        ) : null}
        {error ? <Text style={styles.error}>{error}</Text> : null}

        {!loading && item ? (
          <>
            {/* Hero: framed card image left, identity right (Figma detail language) */}
            <View style={styles.heroRow}>
              <View style={styles.heroImageCol}>
                <View style={styles.heroImageFrame}>
                  {item.imageUrl ? (
                    <Image
                      source={{ uri: item.imageUrl }}
                      style={styles.heroImage}
                      resizeMode="contain"
                    />
                  ) : (
                    <Ionicons name="image-outline" size={s(38)} color={figmaColors.overlayLight} />
                  )}
                </View>
              </View>
              <View style={styles.heroBody}>
                <View style={styles.statusChip}>
                  <Text style={styles.statusChipText}>
                    {statusLabel(item.display_status).toUpperCase()}
                  </Text>
                </View>
                <Text style={styles.heroTitle}>{item.card_title}</Text>
                {meta ? <Text style={styles.heroMeta}>{meta}</Text> : null}
                <Text style={styles.heroStory}>{statusStory(item.display_status)}</Text>
              </View>
            </View>

            {/* Card journey meter, styled like the Figma evidence progress */}
            <View style={styles.journeyBlock}>
              <View style={styles.journeyHeader}>
                <Image
                  source={mostWantedIcons.evidenceDoc}
                  style={styles.journeyIcon}
                  resizeMode="contain"
                />
                <Text style={styles.journeyTitle}>CARD JOURNEY</Text>
                <Text style={styles.journeyPct}>
                  {JOURNEY_STAGES[stageIndex]}
                </Text>
              </View>
              <View style={styles.journeyTrack}>
                <View
                  style={[
                    styles.journeyFill,
                    {
                      width: `${Math.max(journeyPct, 6)}%`,
                      backgroundColor:
                        stageIndex >= 3 ? figmaColors.success : figmaColors.progressFill
                    }
                  ]}
                />
              </View>
              <View style={styles.journeyLabels}>
                {JOURNEY_STAGES.map((stage, index) => (
                  <Text
                    key={stage}
                    style={[
                      styles.journeyStage,
                      index === stageIndex && styles.journeyStageActive,
                      index === 0 && { textAlign: 'left' },
                      index === JOURNEY_STAGES.length - 1 && { textAlign: 'right' }
                    ]}
                    numberOfLines={2}
                  >
                    {stage}
                  </Text>
                ))}
              </View>
            </View>

            {/* Notes panels */}
            {item.review_notes?.trim() ? (
              <View style={styles.notePanel}>
                <View style={styles.notePanelHeader}>
                  <Ionicons
                    name="chatbubble-ellipses-outline"
                    size={s(14)}
                    color={figmaColors.brown}
                  />
                  <Text style={styles.notePanelTitle}>REVIEWER NOTES</Text>
                </View>
                <Text style={styles.notePanelBody}>{item.review_notes.trim()}</Text>
              </View>
            ) : null}
            {item.notes?.trim() ? (
              <View style={styles.notePanel}>
                <View style={styles.notePanelHeader}>
                  <Ionicons name="create-outline" size={s(14)} color={figmaColors.brown} />
                  <Text style={styles.notePanelTitle}>YOUR NOTES</Text>
                </View>
                <Text style={styles.notePanelBody}>{item.notes.trim()}</Text>
              </View>
            ) : null}

            {/* Primary CTA — dark Figma banner */}
            {primaryCta ? (
              <Pressable
                onPress={primaryCta.onPress}
                style={({ pressed }) => [styles.primaryCta, pressed && { opacity: 0.9 }]}
                accessibilityRole="button"
                accessibilityLabel={primaryCta.label}
              >
                <Image
                  source={mostWantedIcons.ctaShield}
                  style={styles.primaryCtaShield}
                  resizeMode="contain"
                />
                <View>
                  <Text style={styles.primaryCtaTitle}>{primaryCta.label.toUpperCase()}</Text>
                  <Text style={styles.primaryCtaSub}>{primaryCta.sub}</Text>
                </View>
              </Pressable>
            ) : null}

            {/* Secondary parchment actions */}
            <View style={styles.secondaryGroup}>
              {canViewMw &&
              item.most_wanted_hunt_id &&
              primaryCta?.label !== databaseCopy.wishlistCtaViewMostWanted ? (
                <SecondaryAction
                  label={databaseCopy.wishlistCtaViewMostWanted}
                  onPress={() => router.push(mostWantedDetailHref(item.most_wanted_hunt_id!))}
                  styles={styles}
                />
              ) : null}
              {canAuth && primaryCta?.label !== databaseCopy.wishlistCtaAuthenticate ? (
                <SecondaryAction
                  label={databaseCopy.wishlistCtaAuthenticate}
                  onPress={() => router.push(createWithLinkedCardHref(catalogId!, item.card_title))}
                  styles={styles}
                />
              ) : null}
              {canViewCard && primaryCta?.label !== databaseCopy.wishlistCtaViewCard ? (
                <SecondaryAction
                  label={databaseCopy.wishlistCtaViewCard}
                  onPress={() => router.push(databaseCardHref(catalogId!))}
                  styles={styles}
                />
              ) : null}
            </View>

            <Pressable
              style={styles.removeBtn}
              disabled={busy}
              onPress={() => void handleRemove()}
              accessibilityRole="button"
            >
              <Ionicons name="trash-outline" size={s(14)} color={figmaColors.error} />
              <Text style={styles.removeText}>{databaseCopy.wishlistCtaRemove}</Text>
            </Pressable>
          </>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function SecondaryAction({
  label,
  onPress,
  styles
}: {
  label: string;
  onPress: () => void;
  styles: ReturnType<typeof createStyles>;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.secondaryBtn, pressed && { opacity: 0.8 }]}
      accessibilityRole="button"
    >
      <Text style={styles.secondaryText}>{label.toUpperCase()}</Text>
      <Image source={mostWantedIcons.ctaArrow} style={styles.secondaryArrow} resizeMode="contain" />
    </Pressable>
  );
}

function createStyles(s: (n: number) => number, t: (n: number) => number) {
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: figmaColors.background },
    content: { paddingHorizontal: s(20), paddingBottom: s(32) },
    error: {
      fontFamily: appFonts.body,
      fontSize: t(15),
      color: figmaColors.error,
      marginBottom: s(12)
    },

    heroRow: {
      flexDirection: 'row',
      gap: s(14),
      backgroundColor: figmaColors.cream,
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      borderRadius: s(12),
      padding: s(12),
      marginBottom: s(14)
    },
    heroImageCol: { width: '42%' },
    heroImageFrame: {
      height: s(170),
      borderRadius: s(10),
      backgroundColor: figmaColors.assetPreviewBg,
      borderWidth: 1,
      borderColor: figmaColors.assetPreviewBorder,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      padding: s(4)
    },
    heroImage: { width: '100%', height: '100%' },
    heroBody: { flex: 1, gap: s(6) },
    statusChip: {
      alignSelf: 'flex-start',
      backgroundColor: figmaColors.tagBg,
      borderWidth: 1,
      borderColor: figmaColors.borderStrong,
      borderRadius: s(4),
      paddingHorizontal: s(8),
      paddingVertical: s(4)
    },
    statusChipText: {
      fontFamily: appFonts.accent,
      fontSize: t(10),
      letterSpacing: 0.5,
      color: figmaColors.brown
    },
    heroTitle: {
      fontFamily: appFonts.bodyBold,
      fontSize: t(19),
      lineHeight: t(23),
      color: figmaColors.charcoal
    },
    heroMeta: {
      fontFamily: appFonts.body,
      fontSize: t(13),
      color: figmaColors.gray
    },
    heroStory: {
      fontFamily: appFonts.body,
      fontSize: t(13),
      lineHeight: t(18),
      color: figmaColors.brownMuted
    },

    journeyBlock: { marginBottom: s(16), gap: s(7) },
    journeyHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(7)
    },
    journeyIcon: { width: s(12), height: s(15) },
    journeyTitle: {
      flex: 1,
      fontFamily: appFonts.accent,
      fontSize: t(13),
      letterSpacing: 0.5,
      color: figmaColors.brown
    },
    journeyPct: {
      fontFamily: appFonts.body,
      fontSize: t(13),
      color: figmaColors.gray
    },
    journeyTrack: {
      height: s(8),
      backgroundColor: figmaColors.progressTrack,
      borderRadius: s(4),
      overflow: 'hidden'
    },
    journeyFill: {
      height: '100%',
      borderRadius: s(4)
    },
    journeyLabels: {
      flexDirection: 'row',
      justifyContent: 'space-between'
    },
    journeyStage: {
      flex: 1,
      fontFamily: appFonts.body,
      fontSize: t(10),
      color: figmaColors.grayMuted,
      textAlign: 'center'
    },
    journeyStageActive: {
      fontFamily: appFonts.bodyBold,
      color: figmaColors.charcoal
    },

    notePanel: {
      backgroundColor: figmaColors.cream,
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      borderRadius: s(9),
      paddingHorizontal: s(12),
      paddingVertical: s(10),
      gap: s(5),
      marginBottom: s(12)
    },
    notePanelHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(7)
    },
    notePanelTitle: {
      fontFamily: appFonts.accent,
      fontSize: t(12),
      letterSpacing: 0.5,
      color: figmaColors.brown
    },
    notePanelBody: {
      fontFamily: appFonts.body,
      fontSize: t(14),
      lineHeight: t(19),
      color: figmaColors.charcoal
    },

    primaryCta: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: s(12),
      backgroundColor: figmaColors.umber,
      borderWidth: 2,
      borderColor: figmaColors.sepia,
      borderRadius: s(12),
      paddingVertical: s(12),
      marginBottom: s(12)
    },
    primaryCtaShield: { width: s(26), height: s(30) },
    primaryCtaTitle: {
      fontFamily: appFonts.accent,
      fontSize: t(16),
      letterSpacing: 0.6,
      color: figmaColors.textOnDark,
      textAlign: 'center'
    },
    primaryCtaSub: {
      fontFamily: appFonts.bodyBold,
      fontSize: t(10),
      letterSpacing: 0.5,
      color: figmaColors.taupeLight,
      textAlign: 'center'
    },

    secondaryGroup: { gap: s(8) },
    secondaryBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: s(8),
      borderWidth: 1,
      borderColor: figmaColors.borderStrong,
      backgroundColor: figmaColors.parchment,
      paddingVertical: s(12)
    },
    secondaryText: {
      fontFamily: appFonts.accent,
      fontSize: t(12),
      letterSpacing: 0.4,
      color: figmaColors.brownMuted
    },
    secondaryArrow: { width: s(9), height: s(9) },

    removeBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: s(6),
      paddingVertical: s(14),
      marginTop: s(6)
    },
    removeText: {
      fontFamily: appFonts.body,
      fontSize: t(14),
      color: figmaColors.error
    }
  });
}
