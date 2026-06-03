import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type ViewStyle
} from 'react-native';
import { authLayout } from '@/constants/authLayout';
import { figmaColors } from '@/constants/figmaColors';
import { useAuthLayout } from '@/hooks/useAuthLayout';
import { MOBILE_OTP_LENGTH } from '@/lib/mobile-auth';

const INVALID_FLASH_MS = 350;

type AuthOtpInputProps = {
  value: string;
  onChangeValue: (value: string) => void;
  editable?: boolean;
  autoFocus?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
  onComplete?: () => void;
};

export function AuthOtpInput({
  value,
  onChangeValue,
  editable = true,
  autoFocus = false,
  containerStyle,
  onComplete
}: AuthOtpInputProps) {
  const { s, t } = useAuthLayout();
  const styles = useMemo(() => createStyles(s, t), [s, t]);
  const inputRef = useRef<TextInput>(null);
  const flashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const selectionRef = useRef({ start: 0, end: 0 });
  const [focused, setFocused] = useState(false);
  const [flash, setFlash] = useState<{ index: number; char: string } | null>(null);
  const [selection, setSelection] = useState({ start: 0, end: 0 });

  const sanitized = useMemo(
    () => value.replace(/\D/g, '').slice(0, MOBILE_OTP_LENGTH),
    [value]
  );

  const digits = useMemo(() => {
    const chars = sanitized.split('');
    while (chars.length < MOBILE_OTP_LENGTH) {
      chars.push('');
    }
    return chars;
  }, [sanitized]);

  const activeIndex = focused
    ? Math.min(Math.max(selection.start, 0), MOBILE_OTP_LENGTH - 1)
    : Math.min(sanitized.length, MOBILE_OTP_LENGTH - 1);

  const focusInput = useCallback(() => {
    if (editable) {
      inputRef.current?.focus();
    }
  }, [editable]);

  const commitValue = useCallback(
    (nextValue: string) => {
      const clean = nextValue.replace(/\D/g, '').slice(0, MOBILE_OTP_LENGTH);
      onChangeValue(clean);
      if (clean.length === MOBILE_OTP_LENGTH) {
        onComplete?.();
      }
    },
    [onChangeValue, onComplete]
  );

  const showInvalidFlash = useCallback((index: number, char: string) => {
    if (flashTimerRef.current) {
      clearTimeout(flashTimerRef.current);
    }
    setFlash({ index, char });
    flashTimerRef.current = setTimeout(() => {
      setFlash(null);
      flashTimerRef.current = null;
    }, INVALID_FLASH_MS);
  }, []);

  const handleChange = useCallback(
    (text: string) => {
      const clean = text.replace(/\D/g, '').slice(0, MOBILE_OTP_LENGTH);

      if (text.length > clean.length) {
        const invalidChar = text.split('').find((char) => !/\d/.test(char));
        if (invalidChar) {
          showInvalidFlash(
            Math.min(selectionRef.current.start, MOBILE_OTP_LENGTH - 1),
            invalidChar
          );
        }
      }

      commitValue(clean);
    },
    [commitValue, showInvalidFlash]
  );

  const handleCellPress = useCallback(
    (index: number) => {
      focusInput();
      const nextValue = index < sanitized.length ? sanitized.slice(0, index) : sanitized;
      if (nextValue !== sanitized) {
        commitValue(nextValue);
      }
      inputRef.current?.setNativeProps({ selection: { start: index, end: index } });
      selectionRef.current = { start: index, end: index };
      setSelection({ start: index, end: index });
    },
    [commitValue, focusInput, sanitized]
  );

  useEffect(() => {
    if (sanitized.length === 0) {
      inputRef.current?.setNativeProps({ selection: { start: 0, end: 0 } });
      selectionRef.current = { start: 0, end: 0 };
      setSelection({ start: 0, end: 0 });
    }
  }, [sanitized]);

  useEffect(() => {
    if (!autoFocus || !editable) return;
    focusInput();
  }, [autoFocus, editable, focusInput]);

  useEffect(
    () => () => {
      if (flashTimerRef.current) {
        clearTimeout(flashTimerRef.current);
      }
    },
    []
  );

  return (
    <View style={[styles.container, containerStyle]}>
      <Pressable style={styles.row} onPress={focusInput} disabled={!editable}>
        {digits.map((digit, index) => {
          const isActive = focused && index === activeIndex;
          const displayChar = flash?.index === index ? flash.char : digit;

          return (
            <Pressable
              key={index}
              style={[styles.cell, isActive && styles.cellActive]}
              onPress={() => handleCellPress(index)}
              disabled={!editable}
              accessibilityRole="none"
              accessibilityLabel={`Digit ${index + 1} of ${MOBILE_OTP_LENGTH}`}
            >
              <Text style={[styles.cellText, flash?.index === index && styles.cellTextFlash]}>
                {displayChar}
              </Text>
            </Pressable>
          );
        })}
      </Pressable>

      <TextInput
        ref={inputRef}
        style={styles.hiddenInput}
        value={sanitized}
        onChangeText={handleChange}
        onSelectionChange={({ nativeEvent }) => {
          selectionRef.current = nativeEvent.selection;
          setSelection(nativeEvent.selection);
        }}
        keyboardType="number-pad"
        inputMode="numeric"
        maxLength={MOBILE_OTP_LENGTH}
        editable={editable}
        autoFocus={autoFocus}
        caretHidden
        importantForAutofill="yes"
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        textContentType="oneTimeCode"
        autoComplete="one-time-code"
        accessibilityLabel={`${MOBILE_OTP_LENGTH}-digit verification code`}
      />
    </View>
  );
}

function createStyles(s: (n: number) => number, t: (n: number) => number) {
  return StyleSheet.create({
    container: {
      width: '100%'
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: s(6)
    },
    cell: {
      flex: 1,
      minHeight: s(48),
      borderRadius: s(10),
      borderWidth: 1,
      borderColor: '#D4D4D4',
      backgroundColor: '#FFFFFF',
      alignItems: 'center',
      justifyContent: 'center'
    },
    cellActive: {
      borderColor: figmaColors.accent,
      borderWidth: 2
    },
    cellText: {
      fontFamily: 'Inter_700Bold',
      fontSize: t(authLayout.fieldFontSize),
      lineHeight: t(24),
      color: figmaColors.charcoal,
      textAlign: 'center'
    },
    cellTextFlash: {
      color: figmaColors.gray
    },
    hiddenInput: {
      position: 'absolute',
      width: 1,
      height: 1,
      opacity: 0
    }
  });
}
