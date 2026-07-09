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

type WantedStatusTagProps = {
  tag: WantedStatusTag;
  s: (n: number) => number;
  t: (n: number) => number;
};

export function WantedStatusTagChip({ tag, s, t }: WantedStatusTagProps) {
  const styles = useMemo(() => createStyles(s, t, tag), [s, t, tag]);
  return (
    <View style={styles.chip}>
      <Text style={styles.text}>{TAG_LABELS[tag]}</Text>
    </View>
  );
}

function createStyles(s: (n: number) => number, t: (n: number) => number, tag: WantedStatusTag) {
  const accent = tag === 'near_solved' || tag === 'high_value';
  return StyleSheet.create({
    chip: {
      backgroundColor: accent ? figmaColors.surfaceHighlight : figmaColors.tagBg,
      borderRadius: s(6),
      paddingHorizontal: s(8),
      paddingVertical: s(3),
      borderWidth: accent ? 1 : 0,
      borderColor: accent ? figmaColors.accent : 'transparent'
    },
    text: {
      fontFamily: appFonts.body,
      fontSize: t(10),
      lineHeight: t(12),
      color: figmaColors.charcoal
    }
  });
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
