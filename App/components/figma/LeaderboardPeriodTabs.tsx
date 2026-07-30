import React, { useMemo } from 'react';
import { appFonts } from '@/constants/appFonts';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { figmaColors } from '@/constants/figmaColors';
import { bodyText } from '@/constants/appTypography';

type PeriodTabsProps<T extends string> = {
  tabs: readonly T[];
  value: T;
  onChange: (value: T) => void;
  s: (n: number) => number;
  t: (n: number) => number;
};

/** Segmented pill toggle — scrolls when many boards. */
export function LeaderboardPeriodTabs<T extends string>({
  tabs,
  value,
  onChange,
  s,
  t
}: PeriodTabsProps<T>) {
  const styles = useMemo(() => createStyles(s, t), [s, t]);
  const many = tabs.length > 2;

  const inner = (
    <View style={[styles.track, many && styles.trackScroll]}>
      {tabs.map((tab) => {
        const active = tab === value;
        return (
          <Pressable
            key={tab}
            onPress={() => onChange(tab)}
            style={[styles.segment, many && styles.segmentCompact, active && styles.segmentActive]}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
          >
            <Text style={[styles.label, active && styles.labelActive]}>{tab}</Text>
          </Pressable>
        );
      })}
    </View>
  );

  if (!many) return inner;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
      style={styles.scroll}
    >
      {inner}
    </ScrollView>
  );
}

function createStyles(s: (n: number) => number, t: (n: number) => number) {
  const tb = (n: number) => bodyText(t, n);

  return StyleSheet.create({
    scroll: {
      marginTop: s(16),
      marginBottom: s(8),
      alignSelf: 'stretch',
      maxWidth: '100%'
    },
    scrollContent: {
      paddingRight: s(8)
    },
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
    trackScroll: {
      marginTop: 0,
      marginBottom: 0
    },
    segment: {
      paddingHorizontal: s(18),
      paddingVertical: s(8),
      borderRadius: s(20),
      minWidth: s(120),
      alignItems: 'center'
    },
    segmentCompact: {
      minWidth: s(88),
      paddingHorizontal: s(12)
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
