import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { appFonts } from '@/constants/appFonts';
import { figmaColors } from '@/constants/figmaColors';

type ScanSubmitButtonProps = {
  onPress: () => void;
  s: (n: number) => number;
  t: (n: number) => number;
  label?: string;
};

const DEFAULT_LABEL = 'SCAN TO SUBMIT YOUR CARD';
const BUTTON_HEIGHT = 58;

export function ScanSubmitButton({ onPress, s, t, label = DEFAULT_LABEL }: ScanSubmitButtonProps) {
  const styles = createStyles(s, t);

  return (
    <Pressable
      style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
    >
      <Text
        style={styles.label}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.82}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function createStyles(s: (n: number) => number, t: (n: number) => number) {
  const height = s(BUTTON_HEIGHT);

  return StyleSheet.create({
    button: {
      width: '100%',
      height,
      borderRadius: height / 2,
      backgroundColor: figmaColors.buttonPrimaryBg,
      borderWidth: s(2),
      borderColor: figmaColors.buttonPrimaryBorder,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: s(20),
      marginVertical: s(12)
    },
    buttonPressed: {
      opacity: 0.9
    },
    label: {
      fontFamily: appFonts.display,
      fontSize: t(20),
      lineHeight: t(26),
      color: figmaColors.buttonPrimaryText,
      letterSpacing: -0.2,
      textAlign: 'center'
    }
  });
}
