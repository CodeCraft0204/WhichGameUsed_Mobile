import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { figmaColors } from '@/constants/figmaColors';
import { useAuthLayout } from '@/hooks/useAuthLayout';

type AuthInfoBannerProps = {
  message: string | null;
};

export function AuthInfoBanner({ message }: AuthInfoBannerProps) {
  const { s, t } = useAuthLayout();
  const styles = useMemo(() => createStyles(s, t), [s, t]);

  if (!message) return null;

  return (
    <View style={styles.banner}>
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
      borderColor: figmaColors.borderLight,
      backgroundColor: figmaColors.infoBg,
      marginBottom: s(8)
    },
    text: {
      fontFamily: 'EBGaramond_600SemiBold',
      fontSize: t(15),
      lineHeight: t(21),
      color: figmaColors.gray,
      textAlign: 'center'
    }
  });
}
