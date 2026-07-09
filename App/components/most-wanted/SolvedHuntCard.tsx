import React, { useMemo } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { appFonts } from '@/constants/appFonts';
import { figmaColors } from '@/constants/figmaColors';
import { figmaIcons } from '@/constants/figmaIcons';
import { HuntCardImage } from '@/components/most-wanted/HuntCardImage';
import { EvidenceProgressMeter } from '@/components/most-wanted/EvidenceProgressMeter';
import { huntDisplayTitle, type SolvedHuntRow } from '@/lib/most-wanted';

type SolvedHuntCardProps = {
  hunt: SolvedHuntRow;
  s: (n: number) => number;
  t: (n: number) => number;
  onPress?: () => void;
};

export function SolvedHuntCard({ hunt, s, t, onPress }: SolvedHuntCardProps) {
  const styles = useMemo(() => createStyles(s, t), [s, t]);
  const content = (
    <>
      <HuntCardImage
        coverImageUrl={hunt.cover_image_url}
        imageUrl={hunt.imageUrl}
        style={styles.image}
      />
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={2}>{huntDisplayTitle(hunt)}</Text>
        <Text style={styles.meta}>Solved by: {hunt.solver_name}</Text>
        <EvidenceProgressMeter
          fulfilled={hunt.requirements_fulfilled}
          total={hunt.requirements_total}
          s={s}
          t={t}
          compact
        />
        {hunt.reward_claimed ? (
          <View style={styles.badge}>
            <Image source={figmaIcons.sealApproved} style={styles.badgeIcon} resizeMode="contain" />
            <Text style={styles.badgeText}>Reward Claimed</Text>
          </View>
        ) : null}
      </View>
    </>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={styles.card}>
        {content}
      </Pressable>
    );
  }

  return <View style={styles.card}>{content}</View>;
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
      width: s(72),
      height: s(88),
      flexShrink: 0
    },
    body: {
      flex: 1,
      gap: s(6)
    },
    title: {
      fontFamily: appFonts.body,
      fontSize: t(16),
      lineHeight: t(20),
      color: figmaColors.charcoal
    },
    meta: {
      fontFamily: appFonts.body,
      fontSize: t(12),
      color: figmaColors.gray
    },
    badge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(6),
      alignSelf: 'flex-start',
      backgroundColor: figmaColors.tagBg,
      borderRadius: s(6),
      paddingHorizontal: s(8),
      paddingVertical: s(4)
    },
    badgeIcon: {
      width: s(14),
      height: s(14)
    },
    badgeText: {
      fontFamily: appFonts.body,
      fontSize: t(11),
      color: figmaColors.charcoal
    }
  });
}
