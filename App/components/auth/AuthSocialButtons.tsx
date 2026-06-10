import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { GoogleBrandIcon } from '@/components/auth/GoogleBrandIcon';
import { figmaColors } from '@/constants/figmaColors';
import { authLayout } from '@/constants/authLayout';
import { useAuthLayout } from '@/hooks/useAuthLayout';

type AuthSocialButtonsProps = {
  onGoogle?: () => void;
  onApple?: () => void;
};

export function AuthSocialButtons({ onGoogle, onApple }: AuthSocialButtonsProps) {
  const { s, t } = useAuthLayout();
  const styles = useMemo(() => createStyles(s, t), [s, t]);

  return (
    <View style={styles.row}>
      <Pressable style={styles.btn} onPress={onGoogle} accessibilityRole="button">
        <GoogleBrandIcon size={s(authLayout.fieldIconSize)} />
        <Text style={styles.label}>Google</Text>
      </Pressable>
      <Pressable style={styles.btn} onPress={onApple} accessibilityRole="button">
        <Ionicons name="logo-apple" size={s(authLayout.fieldIconSize)} color={figmaColors.sepia} />
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
      fontFamily: 'Inter_400Regular',
      fontSize: t(authLayout.socialLabelSize),
      lineHeight: t(22),
      color: figmaColors.charcoal
    }
  });
}
