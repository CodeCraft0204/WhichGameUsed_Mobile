import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { appFonts } from '@/constants/appFonts';
import { figmaColors } from '@/constants/figmaColors';
import type { WantedStatusTag } from '@/lib/most-wanted';

const TAG_LABELS: Record<WantedStatusTag, string> = {
  need_images: 'Need Images',
  need_source: 'Need Source',
  need_research: 'Need Research',
  near_solved: 'Near Solved',
  high_value: 'High Value',
  verified_lead: 'Verified Lead'
};

const TAG_STYLES: Record<WantedStatusTag, { bg: string; border: string; text: string }> = {
  need_images: { bg: figmaColors.infoBg, border: figmaColors.infoBorder, text: figmaColors.brown },
  need_source: { bg: figmaColors.surfaceMuted, border: figmaColors.borderLight, text: figmaColors.gray },
  need_research: { bg: figmaColors.surfaceMuted, border: figmaColors.borderLight, text: figmaColors.gray },
  near_solved: { bg: figmaColors.successBg, border: figmaColors.success, text: figmaColors.success },
  high_value: { bg: figmaColors.surfaceHighlight, border: figmaColors.accent, text: figmaColors.accentStrong },
  verified_lead: { bg: figmaColors.cardFeaturedBg, border: figmaColors.borderStrong, text: figmaColors.brown }
};

export function WantedStatusTagChip({
  tag,
  s,
  t
}: {
  tag: WantedStatusTag;
  s: (n: number) => number;
  t: (n: number) => number;
}) {
  const colors = TAG_STYLES[tag];
  const styles = useMemo(() => createChipStyles(s, t, colors), [s, t, colors]);
  return (
    <View style={styles.chip}>
      <Text style={styles.text}>{TAG_LABELS[tag]}</Text>
    </View>
  );
}

export function WantedStatusTagRow({
  tags,
  s,
  t
}: {
  tags: WantedStatusTag[];
  s: (n: number) => number;
  t: (n: number) => number;
}) {
  if (tags.length < 1) return null;
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: s(6) }}>
      {tags.map((tag) => (
        <WantedStatusTagChip key={tag} tag={tag} s={s} t={t} />
      ))}
    </View>
  );
}

export function SolvedStatusBanner({
  solverName,
  solvedAt,
  rewardClaimed,
  s,
  t
}: {
  solverName?: string | null;
  solvedAt?: string | null;
  rewardClaimed?: boolean;
  s: (n: number) => number;
  t: (n: number) => number;
}) {
  const styles = useMemo(() => createSolvedStyles(s, t), [s, t]);
  return (
    <View style={styles.banner}>
      <Ionicons name="checkmark-circle" size={s(20)} color={figmaColors.success} />
      <View style={styles.body}>
        <Text style={styles.title}>Solved by {solverName ?? 'Community'}</Text>
        {solvedAt ? <Text style={styles.meta}>{new Date(solvedAt).toLocaleDateString()}</Text> : null}
        {rewardClaimed ? <Text style={styles.claimed}>Reward claimed</Text> : null}
      </View>
    </View>
  );
}

function createChipStyles(
  s: (n: number) => number,
  t: (n: number) => number,
  colors: { bg: string; border: string; text: string }
) {
  return StyleSheet.create({
    chip: {
      backgroundColor: colors.bg,
      borderRadius: s(8),
      paddingHorizontal: s(8),
      paddingVertical: s(4),
      borderWidth: 1,
      borderColor: colors.border
    },
    text: {
      fontFamily: appFonts.accent,
      fontSize: t(9),
      letterSpacing: 0.4,
      color: colors.text,
      textTransform: 'uppercase'
    }
  });
}

function createSolvedStyles(s: (n: number) => number, t: (n: number) => number) {
  return StyleSheet.create({
    banner: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: s(10),
      backgroundColor: figmaColors.successBg,
      borderWidth: 1,
      borderColor: figmaColors.success,
      borderRadius: s(12),
      padding: s(12),
      marginBottom: s(14)
    },
    body: { flex: 1, gap: s(2) },
    title: {
      fontFamily: appFonts.bodyBold,
      fontSize: t(15),
      color: figmaColors.charcoal
    },
    meta: {
      fontFamily: appFonts.body,
      fontSize: t(12),
      color: figmaColors.gray
    },
    claimed: {
      fontFamily: appFonts.accent,
      fontSize: t(10),
      letterSpacing: 0.5,
      color: figmaColors.success,
      marginTop: s(2)
    }
  });
}
