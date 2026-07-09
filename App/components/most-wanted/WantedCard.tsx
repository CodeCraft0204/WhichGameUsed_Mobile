import React, { useMemo } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { appFonts } from '@/constants/appFonts';
import { figmaColors } from '@/constants/figmaColors';
import { figmaIcons } from '@/constants/figmaIcons';
import { EvidenceProgressMeter } from '@/components/most-wanted/EvidenceProgressMeter';
import { WantedStatusTagRow } from '@/components/most-wanted/WantedStatusTag';
import { HuntCardImage } from '@/components/most-wanted/HuntCardImage';
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
};

export function WantedCard({ hunt, s, t, onPress, onContribute }: WantedCardProps) {
  const styles = useMemo(() => createStyles(s, t), [s, t]);
  const tags = huntStatusTags(hunt);

  return (
    <Pressable onPress={onPress} style={styles.card}>
      <HuntCardImage
        coverImageUrl={hunt.cover_image_url}
        imageUrl={hunt.imageUrl}
        style={styles.image}
      />

      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={2}>{huntDisplayTitle(hunt)}</Text>
        <Text style={styles.subtitle}>{huntSubtitle(hunt)}</Text>

        {hunt.needed_labels.length > 0 ? (
          <Text style={styles.needed} numberOfLines={2}>
            Needed: {hunt.needed_labels.slice(0, 4).map((l) => `- ${l}`).join(' ')}
          </Text>
        ) : null}

        <EvidenceProgressMeter
          fulfilled={hunt.requirements_fulfilled}
          total={hunt.requirements_total}
          s={s}
          t={t}
          compact
        />

        <View style={styles.footer}>
          <Text style={styles.watchers}>{hunt.watcher_count} collectors watching</Text>
          {hunt.reward_amount_cents > 0 ? (
            <View style={styles.rewardBadge}>
              <Image source={figmaIcons.treasureChest} style={styles.rewardIcon} resizeMode="contain" />
              <Text style={styles.rewardText}>{formatRewardLabel(hunt.reward_amount_cents, hunt.reward_label)}</Text>
            </View>
          ) : null}
        </View>

        <WantedStatusTagRow tags={tags} s={s} t={t} />

        <Pressable onPress={onContribute} style={styles.contributeBtn} accessibilityRole="button">
          <Text style={styles.contributeText}>Contribute</Text>
        </Pressable>
      </View>
    </Pressable>
  );
}

function createStyles(s: (n: number) => number, t: (n: number) => number) {
  return StyleSheet.create({
    card: {
      flexDirection: 'row',
      backgroundColor: figmaColors.cream,
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      borderRadius: s(10),
      padding: s(10),
      marginBottom: s(10),
      gap: s(10)
    },
    image: {
      width: s(80),
      height: s(96),
      flexShrink: 0
    },
    body: {
      flex: 1,
      minWidth: 0,
      gap: s(6)
    },
    title: {
      fontFamily: appFonts.body,
      fontSize: t(16),
      lineHeight: t(20),
      color: figmaColors.charcoal
    },
    subtitle: {
      fontFamily: appFonts.body,
      fontSize: t(12),
      color: figmaColors.gray
    },
    needed: {
      fontFamily: appFonts.body,
      fontSize: t(11),
      lineHeight: t(14),
      color: figmaColors.gray
    },
    footer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: s(8)
    },
    watchers: {
      flex: 1,
      fontFamily: appFonts.body,
      fontSize: t(11),
      color: figmaColors.gray
    },
    rewardBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(4),
      backgroundColor: figmaColors.tagBg,
      borderRadius: s(6),
      paddingHorizontal: s(6),
      paddingVertical: s(2)
    },
    rewardIcon: {
      width: s(14),
      height: s(14)
    },
    rewardText: {
      fontFamily: appFonts.body,
      fontSize: t(11),
      color: figmaColors.charcoal
    },
    contributeBtn: {
      alignSelf: 'flex-start',
      backgroundColor: figmaColors.charcoal,
      borderRadius: s(8),
      paddingHorizontal: s(14),
      paddingVertical: s(6),
      marginTop: s(2)
    },
    contributeText: {
      fontFamily: appFonts.body,
      fontSize: t(13),
      color: figmaColors.cream
    }
  });
}
