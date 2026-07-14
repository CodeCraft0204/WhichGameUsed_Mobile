import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { appFonts } from '@/constants/appFonts';
import { mostWantedCopy } from '@/constants/mostWantedCopy';
import { huntCardBackground, huntCardBorder } from '@/constants/mostWantedStyles';
import { figmaColors } from '@/constants/figmaColors';
import { EvidenceProgressMeter } from '@/components/most-wanted/EvidenceProgressMeter';
import { HuntCardImage } from '@/components/most-wanted/HuntCardImage';
import { MostWantedRewardBadge } from '@/components/most-wanted/MostWantedShared';
import { WantedStatusTagRow } from '@/components/most-wanted/WantedStatusTag';
import {
  formatRewardLabel,
  huntDisplayTitle,
  huntStatusTags,
  huntSubtitle,
  type MostWantedHuntRow
} from '@/lib/most-wanted';

type WantedCardProps = {
  hunt: MostWantedHuntRow;
  s: (n: number) => number;
  t: (n: number) => number;
  onPress: () => void;
  onContribute: () => void;
  compact?: boolean;
};

export function WantedCard({ hunt, s, t, onPress, onContribute, compact }: WantedCardProps) {
  const tags = huntStatusTags(hunt);
  const nearComplete = hunt.status === 'near_solved' || tags.includes('near_solved');
  const styles = useMemo(
    () => createStyles(s, t, huntCardBorder(hunt.status, tags), huntCardBackground(hunt.status, tags), compact),
    [s, t, hunt.status, tags, compact]
  );
  const ctaLabel = nearComplete ? 'Review Progress' : mostWantedCopy.contribute;

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={styles.imageWrap}>
        <HuntCardImage
          coverImageUrl={hunt.cover_image_url}
          imageUrl={hunt.imageUrl}
          style={styles.image}
          framed
          s={s}
        />
        {hunt.reward_amount_cents > 0 ? (
          <View style={styles.rewardOverlay}>
            <MostWantedRewardBadge
              label={formatRewardLabel(hunt.reward_amount_cents, hunt.reward_label)}
              s={s}
              t={t}
            />
          </View>
        ) : null}
      </View>

      <View style={styles.body}>
        <WantedStatusTagRow tags={tags} s={s} t={t} />
        <Text style={styles.title} numberOfLines={2}>
          {huntDisplayTitle(hunt)}
        </Text>
        <Text style={styles.subtitle}>{huntSubtitle(hunt)}</Text>

        {hunt.needed_labels.length > 0 ? (
          <Text style={styles.needed} numberOfLines={2}>
            {mostWantedCopy.neededPrefix} {hunt.needed_labels.slice(0, 3).join(' · ')}
          </Text>
        ) : null}

        <EvidenceProgressMeter
          fulfilled={hunt.requirements_fulfilled}
          total={hunt.requirements_total}
          s={s}
          t={t}
          nearComplete={nearComplete}
        />

        <View style={styles.metaRow}>
          <Ionicons name="eye-outline" size={s(13)} color={figmaColors.gray} />
          <Text style={styles.watchers}>
            {hunt.watcher_count} {mostWantedCopy.watchersSuffix}
          </Text>
          {(hunt.comment_count ?? 0) > 0 ? (
            <>
              <Text style={styles.watchers}>·</Text>
              <Ionicons name="chatbubble-outline" size={s(12)} color={figmaColors.gray} />
              <Text style={styles.watchers}>{hunt.comment_count} discussing</Text>
            </>
          ) : null}
        </View>

        <View style={styles.ctaRow}>
          <Pressable onPress={onPress} style={styles.secondaryBtn}>
            <Text style={styles.secondaryText}>View Details</Text>
          </Pressable>
          <Pressable onPress={onContribute} style={styles.primaryBtn}>
            <Text style={styles.primaryText}>{ctaLabel}</Text>
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}

function createStyles(
  s: (n: number) => number,
  t: (n: number) => number,
  borderColor: string,
  backgroundColor: string,
  compact?: boolean
) {
  return StyleSheet.create({
    card: {
      backgroundColor,
      borderWidth: 1,
      borderColor,
      borderRadius: s(14),
      marginBottom: s(compact ? 12 : 14),
      overflow: 'hidden'
    },
    pressed: { opacity: 0.94 },
    imageWrap: {
      backgroundColor: figmaColors.assetPreviewBg,
      padding: s(12),
      alignItems: 'center',
      borderBottomWidth: 1,
      borderBottomColor: figmaColors.borderLight
    },
    image: {
      width: '100%',
      height: s(compact ? 120 : 150)
    },
    rewardOverlay: {
      position: 'absolute',
      top: s(10),
      right: s(10)
    },
    body: {
      padding: s(14),
      gap: s(8)
    },
    title: {
      fontFamily: appFonts.bodyBold,
      fontSize: t(compact ? 16 : 17),
      lineHeight: t(compact ? 20 : 22),
      color: figmaColors.charcoal
    },
    subtitle: {
      fontFamily: appFonts.body,
      fontSize: t(13),
      color: figmaColors.gray
    },
    needed: {
      fontFamily: appFonts.body,
      fontSize: t(12),
      lineHeight: t(16),
      color: figmaColors.brownMuted
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(5)
    },
    watchers: {
      fontFamily: appFonts.body,
      fontSize: t(12),
      color: figmaColors.gray
    },
    ctaRow: {
      flexDirection: 'row',
      gap: s(8),
      marginTop: s(2)
    },
    secondaryBtn: {
      flex: 1,
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      borderRadius: s(10),
      paddingVertical: s(10),
      alignItems: 'center',
      backgroundColor: figmaColors.surface
    },
    secondaryText: {
      fontFamily: appFonts.bodyBold,
      fontSize: t(12),
      color: figmaColors.charcoal
    },
    primaryBtn: {
      flex: 1,
      borderRadius: s(10),
      paddingVertical: s(10),
      alignItems: 'center',
      backgroundColor: figmaColors.buttonPrimaryBg,
      borderWidth: 1,
      borderColor: figmaColors.buttonPrimaryBorder
    },
    primaryText: {
      fontFamily: appFonts.accent,
      fontSize: t(11),
      letterSpacing: 0.5,
      color: figmaColors.buttonPrimaryText
    }
  });
}
