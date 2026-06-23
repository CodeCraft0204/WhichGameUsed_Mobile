import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { forumUserTextStyle } from '@/constants/discussionContent';
import { ActivityIndicator, Pressable, StyleSheet, TextInput, View } from 'react-native';
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
  const styles = useMemo(() => createStyles(s, t), [s, t]);
  const canSend = value.trim().length > 0 && !busy;

  return (
    <View style={styles.bar}>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={figmaColors.textMuted}
        multiline
        editable={!busy}
        returnKeyType="default"
        blurOnSubmit={false}
        accessibilityLabel="Reply message"
      />
      <Pressable
        style={[styles.sendButton, !canSend && styles.sendButtonDisabled]}
        onPress={onSubmit}
        disabled={!canSend}
        accessibilityRole="button"
        accessibilityLabel="Send reply"
      >
        {busy ? (
          <ActivityIndicator size="small" color={figmaColors.buttonPrimaryText} />
        ) : (
          <Ionicons name="send" size={s(18)} color={figmaColors.buttonPrimaryText} />
        )}
      </Pressable>
    </View>
  );
}

function createStyles(s: (n: number) => number, t: (n: number) => number) {
  return StyleSheet.create({
    bar: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      gap: s(8)
    },
    input: {
      flex: 1,
      minHeight: s(42),
      maxHeight: s(120),
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      borderRadius: s(12),
      paddingHorizontal: s(14),
      paddingTop: s(10),
      paddingBottom: s(10),
      ...forumUserTextStyle(t, 16, 22),
      backgroundColor: figmaColors.cream
    },
    sendButton: {
      width: s(42),
      height: s(42),
      borderRadius: s(21),
      backgroundColor: figmaColors.buttonPrimaryBg,
      borderColor: figmaColors.buttonPrimaryBorder,
      alignItems: 'center',
      justifyContent: 'center'
    },
    sendButtonDisabled: {
      opacity: 0.45
    }
  });
}
