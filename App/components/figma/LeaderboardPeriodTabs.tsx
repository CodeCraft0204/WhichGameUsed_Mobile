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

/** Underline-style period switcher (THIS MONTH / ALL-TIME). */
export function LeaderboardPeriodTabs<T extends string>({
  tabs,
  value,
  onChange,
  s,
  t
}: PeriodTabsProps<T>) {
  const styles = useMemo(() => createStyles(s, t), [s, t]);

  return (
    <View style={styles.row}>
      {tabs.map((tab) => {
        const active = tab === value;
        return (
          <Pressable
            key={tab}
            onPress={() => onChange(tab)}
            style={styles.tab}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
          >
            <Text style={[styles.label, active && styles.labelActive]}>{tab}</Text>
            {active ? <View style={styles.underline} /> : null}
          </Pressable>
        );
      })}
    </View>
  );
}

function createStyles(s: (n: number) => number, t: (n: number) => number) {
  const tb = (n: number) => bodyText(t, n);

  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      gap: s(28),
      marginTop: s(16),
      marginBottom: s(4),
      borderBottomWidth: 1,
      borderBottomColor: figmaColors.divider
    },
    tab: {
      paddingBottom: s(10),
      alignItems: 'center'
    },
    label: {
      fontFamily: appFonts.accent,
      fontSize: tb(13),
      color: figmaColors.gray,
      letterSpacing: 1.4,
      textTransform: 'uppercase'
    },
    labelActive: {
      color: figmaColors.charcoal
    },
    underline: {
      position: 'absolute',
      bottom: -1,
      left: 0,
      right: 0,
      height: 3,
      backgroundColor: figmaColors.charcoal,
      borderRadius: 2
    }
  });
}
