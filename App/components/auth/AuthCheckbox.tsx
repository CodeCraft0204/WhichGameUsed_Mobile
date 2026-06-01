import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
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

  return (
    <Pressable style={styles.row} onPress={onToggle} accessibilityRole="checkbox">
      <View style={[styles.box, checked && styles.boxChecked]}>
        {checked ? <Ionicons name="checkmark" size={s(14)} color="#FFFFFF" /> : null}
      </View>
      <View style={styles.labelWrap}>{typeof label === 'string' ? <Text style={styles.label}>{label}</Text> : label}</View>
    </Pressable>
  );
}

function createStyles(s: (n: number) => number, t: (n: number) => number) {
  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: s(10)
    },
    box: {
      width: s(20),
      height: s(20),
      borderRadius: s(4),
      borderWidth: 1,
      borderColor: figmaColors.black,
      backgroundColor: '#FFFFFF',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: s(2)
    },
    boxChecked: {
      backgroundColor: figmaColors.black
    },
    labelWrap: {
      flex: 1
    },
    label: {
      fontFamily: 'Inter_400Regular',
      fontSize: t(16),
      lineHeight: t(22),
      color: figmaColors.gray
    }
  });
}
