import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { authLayout } from '@/constants/authLayout';
import { figmaColors } from '@/constants/figmaColors';
import { useAuthLayout } from '@/hooks/useAuthLayout';

type AuthCheckboxProps = {
  checked: boolean;
  onToggle: () => void;
  label: React.ReactNode;
};

export function AuthCheckbox({ checked, onToggle, label }: AuthCheckboxProps) {
  const { s, t } = useAuthLayout();
  const styles = useMemo(() => createStyles(s, t), [s, t]);
  const boxSize = s(22);

  return (
    <Pressable
      style={styles.row}
      onPress={onToggle}
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
    >
      <View style={[styles.box, { width: boxSize, height: boxSize }, checked && styles.boxChecked]}>
        {checked ? <Ionicons name="checkmark" size={s(14)} color={figmaColors.textOnDark} /> : null}
      </View>
      <View style={styles.labelWrap}>
        {typeof label === 'string' ? <Text style={styles.label}>{label}</Text> : label}
      </View>
    </Pressable>
  );
}

function createStyles(s: (n: number) => number, t: (n: number) => number) {
  const labelSize = t(authLayout.fieldFontSize);
  const labelLine = t(24);

  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(10),
      flexShrink: 1
    },
    box: {
      borderRadius: s(4),
      borderWidth: 1,
      borderColor: figmaColors.sepia,
      backgroundColor: figmaColors.inputBg,
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0
    },
    boxChecked: {
      backgroundColor: figmaColors.sepia
    },
    labelWrap: {
      flex: 1,
      flexShrink: 1,
      justifyContent: 'center'
    },
    label: {
      fontFamily: 'Inter_400Regular',
      fontSize: labelSize,
      lineHeight: labelLine,
      color: figmaColors.gray
    }
  });
}
