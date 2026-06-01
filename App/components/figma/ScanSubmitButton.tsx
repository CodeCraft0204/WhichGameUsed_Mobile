import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { figmaColors } from '@/constants/figmaColors';

type ScanSubmitButtonProps = {
  onPress: () => void;
  s: (n: number) => number;
  t: (n: number) => number;
};

const BUTTON_HEIGHT = 58;

export function ScanSubmitButton({ onPress, s, t }: ScanSubmitButtonProps) {
  const styles = createStyles(s, t);

  return (
    <Pressable
      style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
      accessibilityRole="button"
      accessibilityLabel="Scan to submit your card"
      onPress={onPress}
    >
      <Text
        style={styles.label}
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.82}
      >
        SCAN TO SUBMIT YOUR CARD
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
      backgroundColor: figmaColors.taupe,
      borderWidth: s(2),
      borderColor: figmaColors.black,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: s(20),
      marginVertical: s(12)
    },
    buttonPressed: {
      opacity: 0.9
    },
    label: {
      fontFamily: 'PermanentMarker_400Regular',
      fontSize: t(20),
      lineHeight: t(26),
      color: figmaColors.black,
      letterSpacing: -0.2,
      textAlign: 'center'
    }
  });
}
