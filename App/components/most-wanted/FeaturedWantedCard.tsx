import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { appFonts } from '@/constants/appFonts';
import { mostWantedCopy } from '@/constants/mostWantedCopy';
import { figmaColors } from '@/constants/figmaColors';
import { EvidenceProgressMeter } from '@/components/most-wanted/EvidenceProgressMeter';
import { HuntCardImage } from '@/components/most-wanted/HuntCardImage';
import { MostWantedContributorBadge } from '@/components/most-wanted/MostWantedShared';
import { WantedStatusTagRow } from '@/components/most-wanted/WantedStatusTag';
import {
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
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={styles.header}>
        <View style={styles.featuredRow}>
          <Ionicons name="star" size={s(14)} color={figmaColors.accentStrong} />
          <Text style={styles.label}>{mostWantedCopy.featuredLabel}</Text>
        </View>
        <MostWantedContributorBadge
          label={mostWantedCopy.badgeCreditChip}
          s={s}
          t={t}
          large
          icon="ribbon"
        />
      </View>

      <View style={styles.imageWrap}>
        <HuntCardImage
          coverImageUrl={hunt.cover_image_url}
          imageUrl={hunt.imageUrl}
          style={styles.image}
          framed
          s={s}
        />
      </View>

      <View style={styles.body}>
        <WantedStatusTagRow tags={tags} s={s} t={t} />
        <Text style={styles.title} numberOfLines={2}>
          {huntDisplayTitle(hunt)}
        </Text>
        <Text style={styles.meta}>Priority need · {primaryNeed}</Text>
        <View style={styles.watchRow}>
          <Ionicons name="eye-outline" size={s(14)} color={figmaColors.gray} />
          <Text style={styles.watchers}>
            {hunt.watcher_count} {mostWantedCopy.watchersSuffix}
          </Text>
        </View>
        <EvidenceProgressMeter
          fulfilled={hunt.requirements_fulfilled}
          total={hunt.requirements_total}
          s={s}
          t={t}
          nearComplete={hunt.status === 'near_solved'}
        />
        <View style={styles.cta}>
          <Text style={styles.ctaText}>{mostWantedCopy.viewHunt}</Text>
        </View>
      </View>
    </Pressable>
  );
}

function createStyles(s: (n: number) => number, t: (n: number) => number) {
  return StyleSheet.create({
    card: {
      backgroundColor: figmaColors.cardFeaturedBg,
      borderWidth: 1,
      borderColor: figmaColors.accent,
      borderRadius: s(14),
      marginBottom: s(18),
      overflow: 'hidden'
    },
    pressed: { opacity: 0.95 },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: s(14),
      paddingTop: s(14),
      paddingBottom: s(8)
    },
    featuredRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(6)
    },
    label: {
      fontFamily: appFonts.accent,
      fontSize: t(12),
      letterSpacing: 0.8,
      color: figmaColors.accentStrong
    },
    imageWrap: {
      paddingHorizontal: s(14),
      paddingBottom: s(8),
      alignItems: 'center'
    },
    image: {
      width: '100%',
      height: s(190)
    },
    body: {
      padding: s(14),
      gap: s(8),
      borderTopWidth: 1,
      borderTopColor: figmaColors.borderLight
    },
    title: {
      fontFamily: appFonts.bodyBold,
      fontSize: t(19),
      lineHeight: t(24),
      color: figmaColors.charcoal
    },
    meta: {
      fontFamily: appFonts.body,
      fontSize: t(13),
      color: figmaColors.gray
    },
    watchRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(6)
    },
    watchers: {
      fontFamily: appFonts.body,
      fontSize: t(12),
      color: figmaColors.gray
    },
    cta: {
      alignSelf: 'stretch',
      marginTop: s(4),
      backgroundColor: figmaColors.buttonPrimaryBg,
      borderRadius: s(10),
      paddingVertical: s(12),
      alignItems: 'center',
      borderWidth: 1,
      borderColor: figmaColors.buttonPrimaryBorder
    },
    ctaText: {
      fontFamily: appFonts.accent,
      fontSize: t(12),
      letterSpacing: 0.6,
      color: figmaColors.buttonPrimaryText
    }
  });
}
