import React, { forwardRef, useMemo } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { appFonts } from '@/constants/appFonts';
import { mostWantedCopy, mostWantedSortOptions, type MostWantedSortKey } from '@/constants/mostWantedCopy';
import { figmaColors } from '@/constants/figmaColors';

type MostWantedSearchSortProps = {
  search: string;
  sort: MostWantedSortKey;
  onSearchChange: (value: string) => void;
  onSortChange: (value: MostWantedSortKey) => void;
  s: (n: number) => number;
  t: (n: number) => number;
};

export const MostWantedSearchSort = forwardRef<TextInput, MostWantedSearchSortProps>(
  function MostWantedSearchSort(
    { search, sort, onSearchChange, onSortChange, s, t },
    ref
  ) {
    const styles = useMemo(() => createStyles(s, t), [s, t]);

    return (
      <View style={styles.wrap}>
        <TextInput
          ref={ref}
          value={search}
          onChangeText={onSearchChange}
          placeholder={mostWantedCopy.searchPlaceholder}
          placeholderTextColor={figmaColors.gray}
          style={styles.search}
          accessibilityLabel="Search Most Wanted hunts"
        />
        <View style={styles.sortRow}>
          <Text style={styles.sortLabel}>{mostWantedCopy.sortLabel}:</Text>
          {mostWantedSortOptions.map((opt) => {
            const active = opt.key === sort;
            return (
              <Pressable
                key={opt.key}
                onPress={() => onSortChange(opt.key)}
                style={[styles.sortChip, active && styles.sortChipActive]}
              >
                <Text style={[styles.sortChipText, active && styles.sortChipTextActive]}>
                  {opt.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    );
  }
);

function createStyles(s: (n: number) => number, t: (n: number) => number) {
  return StyleSheet.create({
    wrap: {
      gap: s(10),
      marginBottom: s(14)
    },
    search: {
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      borderRadius: s(8),
      paddingHorizontal: s(12),
      paddingVertical: s(10),
      fontFamily: appFonts.body,
      fontSize: t(14),
      color: figmaColors.charcoal,
      backgroundColor: figmaColors.cream
    },
    sortRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      alignItems: 'center',
      gap: s(6)
    },
    sortLabel: {
      fontFamily: appFonts.body,
      fontSize: t(12),
      color: figmaColors.gray
    },
    sortChip: {
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      borderRadius: s(6),
      paddingHorizontal: s(8),
      paddingVertical: s(4),
      backgroundColor: figmaColors.cream
    },
    sortChipActive: {
      borderColor: figmaColors.accent,
      backgroundColor: figmaColors.surfaceHighlight
    },
    sortChipText: {
      fontFamily: appFonts.body,
      fontSize: t(11),
      color: figmaColors.gray
    },
    sortChipTextActive: {
      color: figmaColors.charcoal
    }
  });
}
