import React, { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { appFonts } from '@/constants/appFonts';
import { bodyText, broadsheetAccent } from '@/constants/appTypography';
import { figmaColors } from '@/constants/figmaColors';

type ChipOption<T extends string> = {
  key: T;
  label: string;
};

type DatabaseChipRowProps<T extends string> = {
  label: string;
  options: ChipOption<T>[];
  value: T;
  onChange: (value: T) => void;
  s: (n: number) => number;
  t: (n: number) => number;
};

export function DatabaseChipRow<T extends string>({
  label,
  options,
  value,
  onChange,
  s,
  t
}: DatabaseChipRowProps<T>) {
  const styles = useMemo(() => createStyles(s, t), [s, t]);

  return (
    <View style={styles.wrap}>
      {/* <Text style={styles.label}>{label}</Text> */}
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
