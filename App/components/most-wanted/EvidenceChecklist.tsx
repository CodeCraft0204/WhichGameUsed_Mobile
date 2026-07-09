import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { appFonts } from '@/constants/appFonts';
import { figmaColors } from '@/constants/figmaColors';
import type { MostWantedRequirement } from '@/lib/most-wanted';

type EvidenceChecklistProps = {
  items: MostWantedRequirement[];
  s: (n: number) => number;
  t: (n: number) => number;
};

export function EvidenceChecklist({ items, s, t }: EvidenceChecklistProps) {
  const styles = useMemo(() => createStyles(s, t), [s, t]);

  return (
    <View style={styles.wrap}>
      {items.map((item) => (
        <View key={item.id} style={styles.row}>
          <Text style={styles.box}>{item.is_fulfilled ? '☑' : '☐'}</Text>
          <Text style={[styles.label, item.is_fulfilled && styles.done]}>{item.label}</Text>
        </View>
      ))}
    </View>
  );
}

function createStyles(s: (n: number) => number, t: (n: number) => number) {
  return StyleSheet.create({
    wrap: {
      gap: s(8)
    },
    row: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: s(8)
    },
    box: {
      fontFamily: appFonts.body,
      fontSize: t(16),
      color: figmaColors.charcoal,
      width: s(20)
    },
    label: {
      flex: 1,
      fontFamily: appFonts.body,
      fontSize: t(15),
      lineHeight: t(20),
      color: figmaColors.charcoal
    },
    done: {
      color: figmaColors.gray,
      textDecorationLine: 'line-through'
    }
  });
}
