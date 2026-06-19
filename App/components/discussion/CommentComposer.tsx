import React, { useMemo } from 'react';
import { appFonts } from '@/constants/appFonts';
import { forumEmojiTextStyle, forumQuickEmojis, forumUserTextStyle } from '@/constants/discussionContent';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
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

  function appendEmoji(emoji: string) {
    onChangeText(`${value}${emoji}`);
  }

  return (
    <View style={styles.wrap}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.emojiScroll}
        contentContainerStyle={styles.emojiRow}
        keyboardShouldPersistTaps="handled"
      >
        {forumQuickEmojis.map((emoji) => (
          <Pressable
            key={emoji}
            style={styles.emojiButton}
            onPress={() => appendEmoji(emoji)}
            disabled={busy}
            accessibilityRole="button"
            accessibilityLabel={`Insert ${emoji}`}
          >
            <Text style={styles.emoji}>{emoji}</Text>
          </Pressable>
        ))}
      </ScrollView>

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
    emojiScroll: {
      flexGrow: 0,
      flexShrink: 0,
      maxHeight: s(44)
    },
    emojiRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(6),
      paddingVertical: s(2)
    },
    emojiButton: {
      width: s(40),
      height: s(40),
      borderRadius: s(20),
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      backgroundColor: figmaColors.cardFeaturedBg,
      alignItems: 'center',
      justifyContent: 'center'
    },
    emoji: forumEmojiTextStyle(t, 26),
    input: {
      minHeight: s(88),
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      borderRadius: s(12),
      paddingHorizontal: s(12),
      paddingVertical: s(10),
      ...forumUserTextStyle(t, 16, 22),
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
