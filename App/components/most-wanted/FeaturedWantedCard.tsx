import React, { useMemo } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { appFonts } from '@/constants/appFonts';
import { mostWantedCopy } from '@/constants/mostWantedCopy';
import { figmaColors } from '@/constants/figmaColors';
import { figmaIcons } from '@/constants/figmaIcons';
import { EvidenceProgressMeter } from '@/components/most-wanted/EvidenceProgressMeter';
import { WantedStatusTagRow } from '@/components/most-wanted/WantedStatusTag';
import { HuntCardImage } from '@/components/most-wanted/HuntCardImage';
import {
  formatRewardLabel,
  huntDisplayTitle,
  huntStatusTags,
  type MostWantedHuntRow
} from '@/lib/most-wanted';

type FeaturedWantedCardProps = {
  hunt: MostWantedHuntRow;
  s: (n: number) => number;
  t: (n: number) => number;
  onPress: () => void;
};

export function FeaturedWantedCard({ hunt, s, t, onPress }: FeaturedWantedCardProps) {
  const styles = useMemo(() => createStyles(s, t), [s, t]);
  const tags = huntStatusTags(hunt);
  const primaryNeed = hunt.needed_labels[0] ?? 'Evidence';

  return (
    <Pressable onPress={onPress} style={styles.card}>
      <Text style={styles.label}>{mostWantedCopy.featuredLabel}</Text>
      <View style={styles.row}>
        <HuntCardImage
          coverImageUrl={hunt.cover_image_url}
          imageUrl={hunt.imageUrl}
          style={styles.image}
        />
        <View style={styles.body}>
          <Text style={styles.title} numberOfLines={3}>{huntDisplayTitle(hunt)}</Text>
          <Text style={styles.meta}>Status: Need {primaryNeed}</Text>
          <View style={styles.rewardRow}>
            <Image source={figmaIcons.treasureChest} style={styles.rewardIcon} resizeMode="contain" />
            <Text style={styles.reward}>Reward: {formatRewardLabel(hunt.reward_amount_cents, hunt.reward_label)}</Text>
          </View>
          <Text style={styles.progressLabel}>
            Evidence Progress: {hunt.requirements_fulfilled} / {hunt.requirements_total}
          </Text>
          <EvidenceProgressMeter
            fulfilled={hunt.requirements_fulfilled}
            total={hunt.requirements_total}
            s={s}
            t={t}
          />
          <WantedStatusTagRow tags={tags} s={s} t={t} />
          <View style={styles.cta}>
            <Text style={styles.ctaText}>{mostWantedCopy.viewHunt}</Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
}

function createStyles(s: (n: number) => number, t: (n: number) => number) {
  return StyleSheet.create({
    card: {
      backgroundColor: figmaColors.surfaceHighlight,
      borderWidth: 1,
      borderColor: figmaColors.accent,
      borderRadius: s(12),
      padding: s(12),
      marginBottom: s(16)
    },
    label: {
      fontFamily: appFonts.accent,
      fontSize: t(14),
      color: figmaColors.accent,
      marginBottom: s(10)
    },
    row: {
      flexDirection: 'row',
      gap: s(12)
    },
    image: {
      width: s(100),
      height: s(120),
      flexShrink: 0
    },
    body: {
      flex: 1,
      minWidth: 0,
      gap: s(6)
    },
    title: {
      fontFamily: appFonts.body,
      fontSize: t(18),
      lineHeight: t(22),
      color: figmaColors.charcoal
    },
    meta: {
      fontFamily: appFonts.body,
      fontSize: t(12),
      color: figmaColors.gray
    },
    rewardRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(6)
    },
    rewardIcon: {
      width: s(16),
      height: s(16)
    },
    reward: {
      fontFamily: appFonts.body,
      fontSize: t(13),
      color: figmaColors.charcoal
    },
    progressLabel: {
      fontFamily: appFonts.body,
      fontSize: t(12),
      color: figmaColors.gray
    },
    cta: {
      alignSelf: 'flex-start',
      marginTop: s(4),
      backgroundColor: figmaColors.charcoal,
      borderRadius: s(8),
      paddingHorizontal: s(14),
      paddingVertical: s(8)
    },
    ctaText: {
      fontFamily: appFonts.body,
      fontSize: t(13),
      color: figmaColors.cream
    }
  });
}
