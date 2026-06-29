import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { authLayout } from '@/constants/authLayout';
import { appFonts } from '@/constants/appFonts';
import { figmaColors } from '@/constants/figmaColors';
import { useAuthLayout } from '@/hooks/useAuthLayout';

type AuthPrimaryButtonProps = {
  label: string;
  onPress: () => void | Promise<void>;
  disabled?: boolean;
  loading?: boolean;
};

export function AuthPrimaryButton({ label, onPress, disabled, loading }: AuthPrimaryButtonProps) {
  const { s, t } = useAuthLayout();
  const styles = useMemo(() => createStyles(s, t), [s, t]);

  return (
    <Pressable
      style={({ pressed }) => [
        styles.button,
        pressed && styles.buttonPressed,
        disabled && styles.buttonDisabled
      ]}
      accessibilityRole="button"
      disabled={disabled || loading}
      onPress={() => void onPress()}
    >
      <Text style={styles.label} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.82}>
        {loading ? 'PLEASE WAIT…' : label}
      </Text>
    </Pressable>
  );
}

function createStyles(s: (n: number) => number, t: (n: number) => number) {
  const height = s(authLayout.primaryButtonMinHeight);

  return StyleSheet.create({
    button: {
      width: '100%',
      minHeight: height,
      borderRadius: s(12),
      backgroundColor: figmaColors.buttonPrimaryBg,
      borderWidth: s(2),
      borderColor: figmaColors.buttonPrimaryBorder,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: s(20),
      marginTop: s(10)
    },
    buttonPressed: {
      opacity: 0.88
    },
    buttonDisabled: {
      opacity: 0.45
    },
    label: {
      fontFamily: appFonts.display,
      fontSize: t(authLayout.primaryButtonFontSize),
      lineHeight: t(28),
      color: figmaColors.buttonPrimaryText,
      letterSpacing: 0.4,
      textAlign: 'center'
    }
  });
}
