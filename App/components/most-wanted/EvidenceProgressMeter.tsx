import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { appFonts } from '@/constants/appFonts';
import { figmaColors } from '@/constants/figmaColors';

type EvidenceProgressMeterProps = {
  fulfilled: number;
  total: number;
  s: (n: number) => number;
  t: (n: number) => number;
  compact?: boolean;
};

export function EvidenceProgressMeter({ fulfilled, total, s, t, compact }: EvidenceProgressMeterProps) {
  const styles = useMemo(() => createStyles(s, t, compact), [s, t, compact]);
  const safeTotal = Math.max(total, 1);
  const pct = Math.min(100, Math.round((fulfilled / safeTotal) * 100));

  return (
    <View style={styles.wrap}>
      {!compact ? <Text style={styles.label}>Progress: {fulfilled}/{total || 0}</Text> : null}
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${pct}%` }]} />
      </View>
      {compact ? <Text style={styles.compactText}>{fulfilled}/{total || 0}</Text> : null}
    </View>
  );
}

function createStyles(s: (n: number) => number, t: (n: number) => number, compact?: boolean) {
  return StyleSheet.create({
    wrap: {
      gap: s(4),
      flexDirection: compact ? 'row' : 'column',
      alignItems: compact ? 'center' : 'stretch'
    },
    label: {
      fontFamily: appFonts.body,
      fontSize: t(12),
      color: figmaColors.gray
    },
    track: {
      flex: compact ? 1 : undefined,
      height: s(8),
      backgroundColor: figmaColors.tagBg,
      borderRadius: s(4),
      overflow: 'hidden',
      minWidth: compact ? s(80) : undefined
    },
    fill: {
      height: '100%',
      backgroundColor: figmaColors.accent,
      borderRadius: s(4)
    },
    compactText: {
      fontFamily: appFonts.body,
      fontSize: t(12),
      color: figmaColors.gray,
      minWidth: s(28)
    }
  });
}
