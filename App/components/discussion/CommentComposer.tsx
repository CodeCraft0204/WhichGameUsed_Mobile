import React from 'react';
import { appFonts } from '@/constants/appFonts';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { figmaColors } from '@/constants/figmaColors';

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
  busy?: boolean;
  placeholder?: string;
  s: (n: number) => number;
  t: (n: number) => number;
};

export function CommentComposer({
  value,
  onChangeText,
  onSubmit,
  busy = false,
  placeholder = 'Write a reply…',
  s,
  t
}: Props) {
  const styles = createStyles(s, t);

  return (
    <View style={styles.wrap}>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={figmaColors.textMuted}
        multiline
        editable={!busy}
      />
      <Pressable
        style={[styles.button, (!value.trim() || busy) && styles.buttonDisabled]}
        onPress={onSubmit}
        disabled={!value.trim() || busy}
      >
        {busy ? (
          <ActivityIndicator size="small" color={figmaColors.buttonPrimaryText} />
        ) : (
          <Text style={styles.buttonText}>POST</Text>
        )}
      </Pressable>
    </View>
  );
}

function createStyles(s: (n: number) => number, t: (n: number) => number) {
  return StyleSheet.create({
    wrap: {
      gap: s(10),
      marginTop: s(12)
    },
    input: {
      minHeight: s(88),
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      borderRadius: s(12),
      paddingHorizontal: s(12),
      paddingVertical: s(10),
      fontFamily: appFonts.body,
      fontSize: t(15),
      color: figmaColors.charcoal,
      backgroundColor: figmaColors.background
    },
    button: {
      alignSelf: 'flex-end',
      minWidth: s(96),
      height: s(40),
      borderRadius: s(20),
      backgroundColor: figmaColors.buttonPrimaryBg,
      borderWidth: 1,
      borderColor: figmaColors.buttonPrimaryBorder,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: s(16)
    },
    buttonDisabled: {
      opacity: 0.5
    },
    buttonText: {
      fontFamily: appFonts.accent,
      fontSize: t(13),
      color: figmaColors.buttonPrimaryText
    }
  });
}
