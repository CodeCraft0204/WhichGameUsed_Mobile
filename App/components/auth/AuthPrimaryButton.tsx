import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { authLayout } from '@/constants/authLayout';
import { figmaColors } from '@/constants/figmaColors';
import { useAuthLayout } from '@/hooks/useAuthLayout';

type AuthPrimaryButtonProps = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
};

export function AuthPrimaryButton({ label, onPress, disabled }: AuthPrimaryButtonProps) {
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
      disabled={disabled}
      onPress={onPress}
    >
      <Text style={styles.label} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.82}>
        {label}
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
      backgroundColor: figmaColors.black,
      borderWidth: s(2),
      borderColor: figmaColors.black,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: s(20),
      paddingVertical: s(14),
      marginTop: s(10)
    },
    buttonPressed: {
      opacity: 0.88
    },
    buttonDisabled: {
      opacity: 0.45
    },
    label: {
      fontFamily: 'PermanentMarker_400Regular',
      fontSize: t(authLayout.primaryButtonFontSize),
      lineHeight: t(28),
      color: '#FFFFFF',
      letterSpacing: 0.4,
      textAlign: 'center'
    }
  });
}
