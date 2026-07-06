import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { appFonts } from '@/constants/appFonts';
import { bodyText } from '@/constants/appTypography';
import { figmaColors } from '@/constants/figmaColors';

type Props = {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  placeholder?: string;
  sending?: boolean;
  s: (n: number) => number;
  t: (n: number) => number;
};

export function MessageComposer({
  value,
  onChangeText,
  onSend,
  placeholder = 'Type a message…',
  sending = false,
  s,
  t
}: Props) {
  const styles = useMemo(() => createStyles(s, t), [s, t]);
  const canSend = value.trim().length > 0 && !sending;

  return (
    <View style={styles.wrap}>
      <View style={styles.inputShell}>
        <Ionicons name="attach-outline" size={s(20)} color={figmaColors.gray} />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={figmaColors.gray}
          style={styles.input}
          multiline
          maxLength={4000}
          accessibilityLabel="Message input"
        />
      </View>

      <Pressable
        onPress={onSend}
        disabled={!canSend}
        style={[styles.sendBtn, !canSend && styles.sendBtnDisabled]}
        accessibilityRole="button"
        accessibilityLabel="Send message"
      >
        {sending ? (
          <ActivityIndicator size="small" color={figmaColors.charcoal} />
        ) : (
          <Ionicons name="send" size={s(18)} color={figmaColors.charcoal} />
        )}
      </Pressable>
    </View>
  );
}

function createStyles(s: (n: number) => number, t: (n: number) => number) {
  const tb = (n: number) => bodyText(t, n);

  return StyleSheet.create({
    wrap: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      gap: s(10),
      borderTopWidth: 1,
      borderTopColor: figmaColors.divider,
      backgroundColor: figmaColors.parchment,
      paddingHorizontal: s(12),
      paddingTop: s(10),
      paddingBottom: s(10)
    },
    inputShell: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(8),
      minHeight: s(44),
      maxHeight: s(120),
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      borderRadius: s(24),
      backgroundColor: figmaColors.cream,
      paddingHorizontal: s(14),
      paddingVertical: s(8)
    },
    input: {
      flex: 1,
      fontFamily: appFonts.body,
      fontSize: tb(16),
      lineHeight: tb(22),
      color: figmaColors.charcoal,
      maxHeight: s(96),
      paddingVertical: 0
    },
    sendBtn: {
      width: s(44),
      height: s(44),
      borderRadius: s(22),
      backgroundColor: figmaColors.navActive,
      borderWidth: 1,
      borderColor: figmaColors.borderStrong,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOpacity: 0.08,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 2 },
      elevation: 2
    },
    sendBtnDisabled: {
      opacity: 0.45
    }
  });
}
