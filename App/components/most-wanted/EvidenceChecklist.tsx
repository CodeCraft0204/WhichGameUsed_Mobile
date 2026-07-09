import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { appFonts } from '@/constants/appFonts';
import { figmaColors } from '@/constants/figmaColors';
import type { MostWantedRequirement } from '@/lib/most-wanted';

export function EvidenceChecklist({
  items,
  s,
  t
}: {
  items: MostWantedRequirement[];
  s: (n: number) => number;
  t: (n: number) => number;
}) {
  const styles = useMemo(() => createStyles(s, t), [s, t]);

  return (
    <View style={styles.wrap}>
      {items.map((item) => (
        <View key={item.id} style={[styles.row, item.is_fulfilled && styles.rowDone]}>
          <View style={[styles.iconWrap, item.is_fulfilled && styles.iconWrapDone]}>
            <Ionicons
              name={item.is_fulfilled ? 'checkmark' : 'ellipse-outline'}
              size={s(14)}
              color={item.is_fulfilled ? figmaColors.success : figmaColors.gray}
            />
          </View>
          <Text style={[styles.label, item.is_fulfilled && styles.done]}>{item.label}</Text>
        </View>
      ))}
    </View>
  );
}

function createStyles(s: (n: number) => number, t: (n: number) => number) {
  return StyleSheet.create({
    wrap: { gap: s(8) },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(12),
      backgroundColor: figmaColors.cream,
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      borderRadius: s(10),
      paddingHorizontal: s(12),
      paddingVertical: s(12)
    },
    rowDone: {
      backgroundColor: figmaColors.successBg,
      borderColor: figmaColors.success
    },
    iconWrap: {
      width: s(28),
      height: s(28),
      borderRadius: s(14),
      backgroundColor: figmaColors.surfaceMuted,
      alignItems: 'center',
      justifyContent: 'center'
    },
    iconWrapDone: { backgroundColor: figmaColors.surfaceHighlight },
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
