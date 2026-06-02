import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { figmaColors } from '@/constants/figmaColors';
import { useAuthLayout } from '@/hooks/useAuthLayout';

type AuthOtpHelperRowProps = {
  resendLabel: string;
  changeEmailLabel: string;
  onResend: () => void;
  onChangeEmail: () => void;
  disabled?: boolean;
};

export function AuthOtpHelperRow({
  resendLabel,
  changeEmailLabel,
  onResend,
  onChangeEmail,
  disabled
}: AuthOtpHelperRowProps) {
  const { s, t } = useAuthLayout();
  const styles = useMemo(() => createStyles(s, t), [s, t]);

  return (
    <View style={styles.row}>
      <Pressable onPress={onResend} disabled={disabled} hitSlop={8}>
        <Text style={styles.link}>{resendLabel}</Text>
      </Pressable>
      <Text style={styles.dot}>·</Text>
      <Pressable onPress={onChangeEmail} disabled={disabled} hitSlop={8}>
        <Text style={styles.link}>{changeEmailLabel}</Text>
      </Pressable>
    </View>
  );
}

function createStyles(s: (n: number) => number, t: (n: number) => number) {
  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      flexWrap: 'wrap',
      gap: s(6),
      marginTop: s(4),
      marginBottom: s(4)
    },
    link: {
      fontFamily: 'EBGaramond_700Bold',
      fontSize: t(15),
      lineHeight: t(20),
      color: figmaColors.accent
    },
    dot: {
      fontFamily: 'EBGaramond_400Regular',
      fontSize: t(15),
      color: figmaColors.gray
    }
  });
}
