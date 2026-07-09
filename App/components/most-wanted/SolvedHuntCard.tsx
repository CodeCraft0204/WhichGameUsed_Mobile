import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { appFonts } from '@/constants/appFonts';
import { figmaColors } from '@/constants/figmaColors';
import { figmaIcons } from '@/constants/figmaIcons';
import { EvidenceProgressMeter } from '@/components/most-wanted/EvidenceProgressMeter';
import { HuntCardImage } from '@/components/most-wanted/HuntCardImage';
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
      <View style={styles.imageCol}>
        <HuntCardImage
          coverImageUrl={hunt.cover_image_url}
          imageUrl={hunt.imageUrl}
          style={styles.image}
          framed
          s={s}
        />
        <View style={styles.solvedBadge}>
          <Ionicons name="checkmark-circle" size={s(16)} color={figmaColors.success} />
        </View>
      </View>
      <View style={styles.body}>
        <Text style={styles.eyebrow}>SOLVED</Text>
        <Text style={styles.title} numberOfLines={2}>
          {huntDisplayTitle(hunt)}
        </Text>
        <Text style={styles.meta}>Solved by {hunt.solver_name ?? 'Community'}</Text>
        {hunt.solved_at ? (
          <Text style={styles.date}>{new Date(hunt.solved_at).toLocaleDateString()}</Text>
        ) : null}
        <EvidenceProgressMeter
          fulfilled={hunt.requirements_fulfilled}
          total={hunt.requirements_total}
          s={s}
          t={t}
          compact
        />
        {hunt.reward_claimed ? (
          <View style={styles.claimedPill}>
            <Image source={figmaIcons.sealApproved} style={styles.claimedIcon} resizeMode="contain" />
            <Text style={styles.claimedText}>Reward Claimed</Text>
          </View>
        ) : null}
      </View>
    </>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
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
      backgroundColor: figmaColors.successBg,
      borderWidth: 1,
      borderColor: figmaColors.success,
      borderRadius: s(14),
      padding: s(12),
      marginBottom: s(12),
      gap: s(12)
    },
    pressed: { opacity: 0.94 },
    imageCol: { position: 'relative' },
    image: {
      width: s(84),
      height: s(104)
    },
    solvedBadge: {
      position: 'absolute',
      bottom: -s(4),
      right: -s(4),
      backgroundColor: figmaColors.cream,
      borderRadius: s(12),
      padding: s(2),
      borderWidth: 1,
      borderColor: figmaColors.success
    },
    body: { flex: 1, gap: s(4) },
    eyebrow: {
      fontFamily: appFonts.accent,
      fontSize: t(10),
      letterSpacing: 0.8,
      color: figmaColors.success
    },
    title: {
      fontFamily: appFonts.bodyBold,
      fontSize: t(16),
      lineHeight: t(20),
      color: figmaColors.charcoal
    },
    meta: {
      fontFamily: appFonts.body,
      fontSize: t(13),
      color: figmaColors.gray
    },
    date: {
      fontFamily: appFonts.body,
      fontSize: t(11),
      color: figmaColors.brownMuted
    },
    claimedPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(5),
      alignSelf: 'flex-start',
      backgroundColor: figmaColors.tagBg,
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      borderRadius: s(8),
      paddingHorizontal: s(8),
      paddingVertical: s(4),
      marginTop: s(4)
    },
    claimedIcon: { width: s(14), height: s(14) },
    claimedText: {
      fontFamily: appFonts.accent,
      fontSize: t(9),
      letterSpacing: 0.4,
      color: figmaColors.charcoal
    }
  });
}
