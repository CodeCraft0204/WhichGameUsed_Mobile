import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';
import { figmaColors } from '@/constants/figmaColors';

type ProfileToggleRowProps = {
  label: string;
  hint: string;
  value: boolean;
  onValueChange: (next: boolean) => void;
  s: (n: number) => number;
  t: (n: number) => number;
};

export function ProfileToggleRow({
  label,
  hint,
  value,
  onValueChange,
  s,
  t
}: ProfileToggleRowProps) {
  const styles = useMemo(() => createStyles(s, t), [s, t]);

  return (
    <Pressable style={styles.row} onPress={() => onValueChange(!value)}>
      <View style={styles.textWrap}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.hint}>{hint}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: figmaColors.progressTrack, true: figmaColors.bronze }}
        thumbColor={figmaColors.white}
      />
    </Pressable>
  );
}

function createStyles(s: (n: number) => number, t: (n: number) => number) {
  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: s(12),
      paddingVertical: s(4)
    },
    textWrap: {
      flex: 1,
      gap: s(2)
    },
    label: {
      fontFamily: 'EBGaramond_700Bold',
      fontSize: t(19),
      color: figmaColors.charcoal
    },
    hint: {
      fontFamily: 'EBGaramond_600SemiBold',
      fontSize: t(17),
      lineHeight: t(22),
      color: figmaColors.textMuted
    }
  });
}
