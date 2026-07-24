import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { appFonts } from '@/constants/appFonts';
import { figmaColors } from '@/constants/figmaColors';

type Props = {
  years: number[];
  activeYear: number | null;
  onSelectYear: (year: number) => void;
  s: (n: number) => number;
  t: (n: number) => number;
};

export function EducationTimelineYearNav({ years, activeYear, onSelectYear, s, t }: Props) {
  const styles = useMemo(() => createStyles(s, t), [s, t]);

  if (years.length === 0) return null;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      keyboardShouldPersistTaps="handled"
    >
      {years.map((year) => {
        const active = year === activeYear;
        return (
          <Pressable
            key={year}
            onPress={() => onSelectYear(year)}
            style={[styles.chip, active ? styles.chipActive : null]}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            accessibilityLabel={`Jump to ${year}`}
          >
            <Text style={[styles.text, active ? styles.textActive : null]}>{year}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

function createStyles(s: (n: number) => number, t: (n: number) => number) {
  return StyleSheet.create({
    row: {
      gap: s(6),
      paddingVertical: s(4),
      paddingRight: s(8)
    },
    chip: {
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      backgroundColor: figmaColors.cream,
      borderRadius: s(4),
      paddingHorizontal: s(10),
      paddingVertical: s(6)
    },
    chipActive: {
      backgroundColor: figmaColors.umber,
      borderColor: figmaColors.umber
    },
    text: {
      fontFamily: appFonts.accent,
      fontSize: t(12),
      color: figmaColors.brown,
      letterSpacing: 0.4
    },
    textActive: {
      color: figmaColors.cream
    }
  });
}
