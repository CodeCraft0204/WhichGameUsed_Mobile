import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { figmaColors } from '@/constants/figmaColors';
import { useAuthLayout } from '@/hooks/useAuthLayout';

type AuthBackButtonProps = {
  label?: string;
  onPress: () => void;
};

export function AuthBackButton({ label = 'Back', onPress }: AuthBackButtonProps) {
  const { s, t } = useAuthLayout();
  const styles = useMemo(() => createStyles(s, t), [s, t]);

  return (
    <Pressable style={styles.btn} onPress={onPress} hitSlop={8} accessibilityRole="button">
      <Ionicons name="chevron-back" size={s(20)} color={figmaColors.accent} />
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}

function createStyles(s: (n: number) => number, t: (n: number) => number) {
  return StyleSheet.create({
    btn: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      gap: s(4),
      marginBottom: s(8)
    },
    label: {
      fontFamily: 'EBGaramond_600SemiBold',
      fontSize: t(18),
      lineHeight: t(24),
      color: figmaColors.accent
    }
  });
}
