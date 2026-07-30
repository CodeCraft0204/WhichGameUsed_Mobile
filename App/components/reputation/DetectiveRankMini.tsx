import React, { useMemo } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { detectiveRankImage } from '@/constants/reputationContent';

/** Compact detective rank badge for discussion / researcher rows. */
export function DetectiveRankMini({
  level,
  s,
  size = 22
}: {
  level: number | null | undefined;
  s: (n: number) => number;
  size?: number;
}) {
  const styles = useMemo(() => createStyles(s, size), [s, size]);
  const lvl = Math.min(5, Math.max(1, Number(level) || 1));
  return (
    <View style={styles.wrap} accessibilityLabel={`Detective rank level ${lvl}`}>
      <Image source={detectiveRankImage(lvl)} style={styles.icon} resizeMode="contain" />
    </View>
  );
}

function createStyles(s: (n: number) => number, size: number) {
  return StyleSheet.create({
    wrap: {
      width: s(size),
      height: s(size),
      borderRadius: s(size / 2),
      overflow: 'hidden',
      backgroundColor: 'transparent'
    },
    icon: { width: '100%', height: '100%' }
  });
}
