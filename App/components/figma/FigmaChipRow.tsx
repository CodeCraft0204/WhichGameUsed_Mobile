import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { appFonts } from '@/constants/appFonts';
import { bodyText, broadsheetAccent } from '@/constants/appTypography';
import { figmaColors } from '@/constants/figmaColors';

export type FigmaChipOption<T extends string> = {
  key: T;
  label: string;
};

export function chipOptionsFromLabels<T extends string>(labels: readonly T[]): FigmaChipOption<T>[] {
  return labels.map((label) => ({ key: label, label }));
}

type FigmaChipRowProps<T extends string> = {
  options: FigmaChipOption<T>[];
  value: T;
  onChange: (value: T) => void;
  s: (n: number) => number;
  t: (n: number) => number;
  label?: string;
  style?: StyleProp<ViewStyle>;
};

/** Horizontal filter/tab chips — matches database sport selection row. */
export function FigmaChipRow<T extends string>({
  options,
  value,
  onChange,
  s,
  t,
  label,
  style
}: FigmaChipRowProps<T>) {
  const styles = useMemo(() => createStyles(s, t), [s, t]);

  return (
    <View style={[styles.wrap, style]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
        keyboardShouldPersistTaps="handled"
      >
        {options.map((opt) => {
          const active = opt.key === value;
          return (
            <Pressable
              key={opt.key}
              onPress={() => onChange(opt.key)}
              style={[styles.chip, active && styles.chipActive]}
              accessibilityRole="button"
              accessibilityState={{ selected: active }}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{opt.label}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

function createStyles(s: (n: number) => number, t: (n: number) => number) {
  const tb = (n: number) => bodyText(t, n);

  return StyleSheet.create({
    wrap: { marginVertical: s(20) },
    label: {
      fontFamily: appFonts.accent,
      fontSize: tb(10),
      color: figmaColors.gray,
      marginTop: s(10),
      marginBottom: s(8),
      ...broadsheetAccent
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(10),
      paddingRight: s(4)
    },
    chip: {
      minHeight: s(40),
      paddingHorizontal: s(16),
      borderRadius: s(20),
      borderWidth: 1,
      borderColor: figmaColors.tabInactiveBorder,
      backgroundColor: figmaColors.tabInactiveBg,
      alignItems: 'center',
      justifyContent: 'center'
    },
    chipActive: {
      backgroundColor: figmaColors.tabActiveBg,
      borderColor: figmaColors.tabActiveBorder
    },
    chipText: {
      fontFamily: appFonts.body,
      fontSize: tb(13),
      color: figmaColors.tabText
    },
    chipTextActive: {
      color: figmaColors.tabTextActive
    }
  });
}
