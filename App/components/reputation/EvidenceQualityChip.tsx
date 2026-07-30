import React, { useMemo } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { appFonts } from '@/constants/appFonts';
import { figmaColors } from '@/constants/figmaColors';
import { reputationCopy } from '@/constants/reputationCopy';
import {
  evidenceQualityLabel,
  reputationUiImages
} from '@/constants/reputationContent';

/** Police-star quality row (filled stars = level). */
export function EvidenceQualityChip({
  level,
  s,
  t,
  compact
}: {
  level: number | null | undefined;
  s: (n: number) => number;
  t: (n: number) => number;
  compact?: boolean;
}) {
  const styles = useMemo(() => createStyles(s, t, compact), [s, t, compact]);
  if (level == null || level < 1) return null;
  const filled = Math.min(5, Math.max(1, Math.round(level)));

  return (
    <View style={styles.chip} accessibilityLabel={`${reputationCopy.qualityTitle}: ${evidenceQualityLabel(level)}`}>
      <View style={styles.stars}>
        {[1, 2, 3, 4, 5].map((n) => (
          <Image
            key={n}
            source={n <= filled ? reputationUiImages.qualityStar : reputationUiImages.qualityStarEmpty}
            style={styles.star}
            resizeMode="contain"
          />
        ))}
      </View>
      {!compact ? (
        <Text style={styles.label}>{evidenceQualityLabel(level)}</Text>
      ) : null}
    </View>
  );
}

function createStyles(s: (n: number) => number, t: (n: number) => number, compact?: boolean) {
  return StyleSheet.create({
    chip: {
      alignSelf: 'flex-start',
      gap: s(4),
      marginTop: s(4),
      paddingHorizontal: compact ? 0 : s(8),
      paddingVertical: compact ? 0 : s(4),
      borderRadius: s(8),
      backgroundColor: compact ? 'transparent' : figmaColors.tagBg,
      borderWidth: compact ? 0 : 1,
      borderColor: figmaColors.borderLight
    },
    stars: { flexDirection: 'row', gap: s(2), alignItems: 'center' },
    star: { width: s(compact ? 14 : 18), height: s(compact ? 14 : 18) },
    label: {
      fontFamily: appFonts.body,
      fontSize: t(10),
      color: figmaColors.brown
    }
  });
}
