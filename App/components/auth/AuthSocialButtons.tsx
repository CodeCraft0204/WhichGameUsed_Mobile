import { Ionicons } from '@expo/vector-icons';
import { appFonts } from '@/constants/appFonts';
import React, { useMemo } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { GoogleBrandIcon } from '@/components/auth/GoogleBrandIcon';
import { figmaColors } from '@/constants/figmaColors';
import { authLayout } from '@/constants/authLayout';
import { useAuthLayout } from '@/hooks/useAuthLayout';

type AuthSocialButtonsProps = {
  onGoogle?: () => void;
  onApple?: () => void;
  googleLoading?: boolean;
  appleLoading?: boolean;
  disabled?: boolean;
};

export function AuthSocialButtons({
  onGoogle,
  onApple,
  googleLoading = false,
  appleLoading = false,
  disabled = false
}: AuthSocialButtonsProps) {
  const { s, t } = useAuthLayout();
  const styles = useMemo(() => createStyles(s, t), [s, t]);
  const socialBusy = googleLoading || appleLoading;

  return (
    <View style={styles.row}>
      <Pressable
        style={[styles.btn, (disabled || socialBusy) && styles.btnDisabled]}
        onPress={onGoogle}
        disabled={disabled || socialBusy || !onGoogle}
        accessibilityRole="button"
        accessibilityState={{ disabled: disabled || socialBusy || !onGoogle }}
      >
        {googleLoading ? (
          <ActivityIndicator size="small" color={figmaColors.charcoal} />
        ) : (
          <GoogleBrandIcon size={s(authLayout.fieldIconSize)} />
        )}
        <Text style={styles.label}>Google</Text>
      </Pressable>
      <Pressable
        style={[styles.btn, (disabled || socialBusy) && styles.btnDisabled]}
        onPress={onApple}
        disabled={disabled || socialBusy || !onApple}
        accessibilityRole="button"
        accessibilityState={{ disabled: disabled || socialBusy || !onApple }}
      >
        {appleLoading ? (
          <ActivityIndicator size="small" color={figmaColors.charcoal} />
        ) : (
          <Ionicons name="logo-apple" size={s(authLayout.fieldIconSize)} color={figmaColors.sepia} />
        )}
        <Text style={styles.label}>Apple</Text>
      </Pressable>
    </View>
  );
}

function createStyles(s: (n: number) => number, t: (n: number) => number) {
  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      gap: s(12)
    },
    btn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: s(8),
      minHeight: s(authLayout.socialButtonMinHeight),
      borderRadius: s(12),
      borderWidth: 1,
      borderColor: figmaColors.inputBorder,
      backgroundColor: figmaColors.inputBg
    },
    label: {
      fontFamily: appFonts.body,
      fontSize: t(authLayout.socialLabelSize),
      lineHeight: t(22),
      color: figmaColors.charcoal
    },
    btnDisabled: {
      opacity: 0.6
    }
  });
}
