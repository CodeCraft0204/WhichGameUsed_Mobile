import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { figmaColors } from '@/constants/figmaColors';
import { useAuthLayout } from '@/hooks/useAuthLayout';

type AuthTextLinkProps = {
  prefix?: string;
  linkLabel: string;
  onPress: () => void;
  align?: 'center' | 'left' | 'right';
};

export function AuthTextLink({ prefix, linkLabel, onPress, align = 'center' }: AuthTextLinkProps) {
  const { s, t } = useAuthLayout();
  const styles = useMemo(() => createStyles(s, t, align), [s, t, align]);

  return (
    <View style={styles.row}>
      {prefix ? <Text style={styles.prefix}>{prefix} </Text> : null}
      <Pressable onPress={onPress} hitSlop={8} accessibilityRole="link">
        <Text style={styles.link}>{linkLabel}</Text>
      </Pressable>
    </View>
  );
}

function createStyles(
  s: (n: number) => number,
  t: (n: number) => number,
  align: 'center' | 'left' | 'right'
) {
  const justify =
    align === 'left' ? 'flex-start' : align === 'right' ? 'flex-end' : 'center';

  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: justify,
      alignItems: 'center',
      paddingVertical: s(4)
    },
    prefix: {
      fontFamily: 'EBGaramond_400Regular',
      fontSize: t(18),
      lineHeight: t(24),
      color: figmaColors.gray
    },
    link: {
      fontFamily: 'EBGaramond_700Bold',
      fontSize: t(18),
      lineHeight: t(24),
      color: figmaColors.accent
    }
  });
}
