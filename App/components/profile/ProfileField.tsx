import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';
import { figmaColors } from '@/constants/figmaColors';

type ProfileFieldIcon = 'person' | 'at' | 'document-text' | 'location' | 'mail';

type ProfileFieldProps = TextInputProps & {
  label: string;
  hint?: string;
  icon: ProfileFieldIcon;
  s: (n: number) => number;
  t: (n: number) => number;
  readOnly?: boolean;
};

const iconMap: Record<ProfileFieldIcon, keyof typeof Ionicons.glyphMap> = {
  person: 'person-outline',
  at: 'at-outline',
  'document-text': 'document-text-outline',
  location: 'location-outline',
  mail: 'mail-outline'
};

export function ProfileField({
  label,
  hint,
  icon,
  s,
  t,
  readOnly,
  style,
  ...inputProps
}: ProfileFieldProps) {
  const styles = useMemo(() => createStyles(s, t), [s, t]);

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
      <View style={[styles.inputRow, readOnly && styles.inputRowReadOnly]}>
        <Ionicons name={iconMap[icon]} size={s(22)} color={figmaColors.gray} />
        <TextInput
          placeholderTextColor={figmaColors.textMuted}
          editable={!readOnly}
          style={[styles.input, readOnly && styles.inputReadOnly, style]}
          {...inputProps}
        />
      </View>
    </View>
  );
}

function createStyles(s: (n: number) => number, t: (n: number) => number) {
  return StyleSheet.create({
    wrap: {
      gap: s(4)
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
    },
    inputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(10),
      minHeight: s(54),
      borderWidth: 1,
      borderColor: figmaColors.inputBorder,
      borderRadius: s(12),
      backgroundColor: figmaColors.inputBg,
      paddingHorizontal: s(14)
    },
    inputRowReadOnly: {
      backgroundColor: figmaColors.surfaceMuted,
      borderColor: figmaColors.borderLight
    },
    input: {
      flex: 1,
      fontFamily: 'Inter_400Regular',
      fontSize: t(18),
      color: figmaColors.charcoal,
      paddingVertical: s(12)
    },
    inputReadOnly: {
      color: figmaColors.textSecondary
    }
  });
}
