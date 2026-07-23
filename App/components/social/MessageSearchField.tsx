import { Ionicons } from '@expo/vector-icons';
import React, { forwardRef, useMemo } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { appFonts } from '@/constants/appFonts';
import { bodyText } from '@/constants/appTypography';
import { figmaColors } from '@/constants/figmaColors';

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  s: (n: number) => number;
  t: (n: number) => number;
};

export const MessageSearchField = forwardRef<TextInput, Props>(function MessageSearchField(
  { value, onChangeText, placeholder = 'Search messages', s, t },
  ref
) {
  const styles = useMemo(() => createStyles(s, t), [s, t]);

  return (
    <View style={styles.wrap}>
      <Ionicons name="search" size={s(18)} color={figmaColors.gray} />
      <TextInput
        ref={ref}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={figmaColors.gray}
        style={styles.input}
        autoCapitalize="none"
        autoCorrect={false}
        clearButtonMode="while-editing"
        accessibilityLabel={placeholder}
      />
    </View>
  );
});

function createStyles(s: (n: number) => number, t: (n: number) => number) {
  const tb = (n: number) => bodyText(t, n);

  return StyleSheet.create({
    wrap: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(10),
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      borderRadius: s(24),
      backgroundColor: figmaColors.cream,
      paddingHorizontal: s(14),
      minHeight: s(44),
      marginBottom: s(12)
    },
    input: {
      flex: 1,
      fontFamily: appFonts.body,
      fontSize: tb(16),
      color: figmaColors.charcoal,
      paddingVertical: s(8)
    }
  });
}
