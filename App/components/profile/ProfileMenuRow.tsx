import { Ionicons } from '@expo/vector-icons';
import { appFonts } from '@/constants/appFonts';
import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { figmaColors } from '@/constants/figmaColors';

type ProfileMenuRowProps = {
  label: string;
  value?: string;
  destructive?: boolean;
  showChevron?: boolean;
  onPress?: () => void;
  s: (n: number) => number;
  t: (n: number) => number;
};

export function ProfileMenuRow({
  label,
  value,
  destructive,
  showChevron = true,
  onPress,
  s,
  t
}: ProfileMenuRowProps) {
  const styles = useMemo(() => createStyles(s, t), [s, t]);
  const interactive = Boolean(onPress);

  const content = (
    <>
      <Text style={[styles.label, destructive && styles.destructive]}>{label}</Text>
      <View style={styles.trailing}>
        {value ? <Text style={styles.value}>{value}</Text> : null}
        {showChevron && interactive ? (
          <Ionicons
            name="chevron-forward"
            size={s(18)}
            color={destructive ? figmaColors.error : figmaColors.gray}
          />
        ) : null}
      </View>
    </>
  );

  if (!interactive) {
    return <View style={styles.row}>{content}</View>;
  }

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      accessibilityRole="button"
    >
      {content}
    </Pressable>
  );
}

function createStyles(s: (n: number) => number, t: (n: number) => number) {
  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      minHeight: s(44),
      borderTopWidth: 1,
      borderTopColor: figmaColors.divider,
      paddingTop: s(12)
    },
    pressed: {
      opacity: 0.85
    },
    label: {
      fontFamily: appFonts.body,
      fontSize: t(19),
      color: figmaColors.charcoal
    },
    destructive: {
      color: figmaColors.error
    },
    trailing: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(6)
    },
    value: {
      fontFamily: appFonts.body,
      fontSize: t(17),
      color: figmaColors.textMuted
    }
  });
}
