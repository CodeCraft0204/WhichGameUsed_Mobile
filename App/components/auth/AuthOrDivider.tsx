import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { figmaColors } from '@/constants/figmaColors';
import { useAuthLayout } from '@/hooks/useAuthLayout';

type AuthOrDividerProps = {
  label?: string;
};

export function AuthOrDivider({ label = 'or continue with' }: AuthOrDividerProps) {
  const { s, t } = useAuthLayout();
  const styles = useMemo(() => createStyles(s, t), [s, t]);

  return (
    <View style={styles.wrap}>
      <View style={styles.line} />
      <Text style={styles.label}>{label}</Text>
      <View style={styles.line} />
    </View>
  );
}

function createStyles(s: (n: number) => number, t: (n: number) => number) {
  return StyleSheet.create({
    wrap: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(12),
      marginVertical: s(16)
    },
    line: {
      flex: 1,
      height: 1,
      backgroundColor: figmaColors.borderLight
    },
    label: {
      fontFamily: 'Inter_400Regular',
      fontSize: t(15),
      lineHeight: t(20),
      color: figmaColors.gray
    }
  });
}
