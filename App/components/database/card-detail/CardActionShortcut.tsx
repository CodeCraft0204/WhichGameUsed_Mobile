import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { appFonts } from '@/constants/appFonts';
import { bodyText } from '@/constants/appTypography';
import { figmaColors } from '@/constants/figmaColors';

type CardActionShortcutProps = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress?: () => void;
  s: (n: number) => number;
  t: (n: number) => number;
};

export function CardActionShortcut({ icon, label, onPress, s, t }: CardActionShortcutProps) {
  const styles = useMemo(() => createStyles(s, t), [s, t]);

  return (
    <Pressable
      style={styles.wrap}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <View style={styles.circle}>
        <Ionicons name={icon} size={s(22)} color={figmaColors.charcoal} />
      </View>
      <Text style={styles.label} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

function createStyles(s: (n: number) => number, t: (n: number) => number) {
  const tb = (n: number) => bodyText(t, n);
  return StyleSheet.create({
    wrap: {
      flex: 1,
      alignItems: 'center',
      gap: s(6),
      minWidth: 0
    },
    circle: {
      width: s(52),
      height: s(52),
      borderRadius: s(26),
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      backgroundColor: figmaColors.cream,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: figmaColors.black,
      shadowOffset: { width: 0, height: s(2) },
      shadowOpacity: 0.05,
      shadowRadius: s(4),
      elevation: 2
    },
    label: {
      fontFamily: appFonts.accent,
      fontSize: tb(11),
      color: figmaColors.brown,
      letterSpacing: 0.6,
      textAlign: 'center'
    }
  });
}
