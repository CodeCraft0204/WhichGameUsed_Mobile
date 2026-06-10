import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { figmaColors } from '@/constants/figmaColors';
import { useAuthLayout } from '@/hooks/useAuthLayout';

type AuthErrorBannerProps = {
  message: string | null;
};

export function AuthErrorBanner({ message }: AuthErrorBannerProps) {
  const { s, t } = useAuthLayout();
  const styles = useMemo(() => createStyles(s, t), [s, t]);

  if (!message) return null;

  return (
    <View style={styles.banner} accessibilityRole="alert">
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

function createStyles(s: (n: number) => number, t: (n: number) => number) {
  return StyleSheet.create({
    banner: {
      padding: s(12),
      borderRadius: s(10),
      borderWidth: 1,
      borderColor: figmaColors.errorBorder,
      backgroundColor: figmaColors.errorBg,
      marginBottom: s(8)
    },
    text: {
      fontFamily: 'EBGaramond_600SemiBold',
      fontSize: t(15),
      lineHeight: t(21),
      color: figmaColors.charcoal,
      textAlign: 'center'
    }
  });
}
