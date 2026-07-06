import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { appFonts } from '@/constants/appFonts';
import { bodyText } from '@/constants/appTypography';
import { figmaColors } from '@/constants/figmaColors';

export type InboxSegment = 'conversations' | 'requests';

type Props = {
  value: InboxSegment;
  onChange: (segment: InboxSegment) => void;
  requestCount?: number;
  s: (n: number) => number;
  t: (n: number) => number;
};

export function InboxSegmentTabs({ value, onChange, requestCount = 0, s, t }: Props) {
  const styles = useMemo(() => createStyles(s, t), [s, t]);

  return (
    <View style={styles.row}>
      <Pressable
        onPress={() => onChange('conversations')}
        style={[styles.tab, value === 'conversations' && styles.tabActive]}
        accessibilityRole="tab"
        accessibilityState={{ selected: value === 'conversations' }}
      >
        <Text style={[styles.tabText, value === 'conversations' && styles.tabTextActive]}>
          CONVERSATIONS
        </Text>
      </Pressable>

      <Pressable
        onPress={() => onChange('requests')}
        style={[styles.tab, value === 'requests' && styles.tabActive]}
        accessibilityRole="tab"
        accessibilityState={{ selected: value === 'requests' }}
      >
        <Text style={[styles.tabText, value === 'requests' && styles.tabTextActive]}>
          REQUESTS{requestCount > 0 ? ` (${requestCount})` : ''}
        </Text>
      </Pressable>
    </View>
  );
}

function createStyles(s: (n: number) => number, t: (n: number) => number) {
  const tb = (n: number) => bodyText(t, n);

  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderBottomColor: figmaColors.divider,
      marginBottom: s(12)
    },
    tab: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: s(12),
      borderBottomWidth: 2,
      borderBottomColor: 'transparent'
    },
    tabActive: {
      borderBottomColor: figmaColors.navActive
    },
    tabText: {
      fontFamily: appFonts.accent,
      fontSize: tb(12),
      letterSpacing: 0.8,
      color: figmaColors.gray
    },
    tabTextActive: {
      color: figmaColors.charcoal,
      fontFamily: appFonts.bodyBold
    }
  });
}
