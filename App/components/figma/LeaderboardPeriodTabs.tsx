import React, { useMemo } from 'react';
import { appFonts } from '@/constants/appFonts';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { figmaColors } from '@/constants/figmaColors';
import { bodyText } from '@/constants/appTypography';

type PeriodTabsProps<T extends string> = {
  tabs: readonly T[];
  value: T;
  onChange: (value: T) => void;
  s: (n: number) => number;
  t: (n: number) => number;
};

/** Segmented pill toggle — Figma THIS MONTH / ALL-TIME. */
export function LeaderboardPeriodTabs<T extends string>({
  tabs,
  value,
  onChange,
  s,
  t
}: PeriodTabsProps<T>) {
  const styles = useMemo(() => createStyles(s, t), [s, t]);

  return (
    <View style={styles.track}>
      {tabs.map((tab) => {
        const active = tab === value;
        return (
          <Pressable
            key={tab}
            onPress={() => onChange(tab)}
            style={[styles.segment, active && styles.segmentActive]}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
          >
            <Text style={[styles.label, active && styles.labelActive]}>{tab}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function createStyles(s: (n: number) => number, t: (n: number) => number) {
  const tb = (n: number) => bodyText(t, n);

  return StyleSheet.create({
    track: {
      flexDirection: 'row',
      alignSelf: 'flex-start',
      borderWidth: 1.5,
      borderColor: figmaColors.tabInactiveBorder,
      borderRadius: s(24),
      backgroundColor: figmaColors.tabInactiveBg,
      padding: s(3),
      marginTop: s(16),
      marginBottom: s(8)
    },
    segment: {
      paddingHorizontal: s(18),
      paddingVertical: s(8),
      borderRadius: s(20),
      minWidth: s(120),
      alignItems: 'center'
    },
    segmentActive: {
      backgroundColor: figmaColors.tabActiveBg
    },
    label: {
      fontFamily: appFonts.accent,
      fontSize: tb(11),
      color: figmaColors.tabText,
      letterSpacing: 1.1,
      textTransform: 'uppercase'
    },
    labelActive: {
      color: figmaColors.tabTextActive
    }
  });
}
