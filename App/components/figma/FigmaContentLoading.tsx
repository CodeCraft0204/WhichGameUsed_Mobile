import React, { useMemo } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { appFonts } from '@/constants/appFonts';
import { figmaColors } from '@/constants/figmaColors';

/**
 * Centered loading UI for a hub page main content section.
 * Use `fill` with a flexGrow scroll body so the spinner sits at the
 * center of the remaining area below the header (above bottom CTAs).
 */
export function FigmaContentLoading({
  message,
  s,
  t,
  fill = true
}: {
  message: string;
  s: (n: number) => number;
  t: (n: number) => number;
  /** When true, grows to fill available main-content space and centers inside it. */
  fill?: boolean;
}) {
  const styles = useMemo(() => createStyles(s, t, fill), [s, t, fill]);
  return (
    <View style={styles.wrap} accessibilityRole="progressbar" accessibilityLabel={message}>
      <ActivityIndicator size="large" color={figmaColors.charcoal} />
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

function createStyles(s: (n: number) => number, t: (n: number) => number, fill: boolean) {
  return StyleSheet.create({
    wrap: {
      ...(fill
        ? { flexGrow: 1, flexShrink: 0, minHeight: s(180) }
        : { paddingVertical: s(24) }),
      justifyContent: 'center',
      alignItems: 'center',
      gap: s(12),
      paddingHorizontal: s(8)
    },
    message: {
      fontFamily: appFonts.body,
      fontSize: t(16),
      lineHeight: t(22),
      color: figmaColors.gray,
      textAlign: 'center',
      paddingHorizontal: s(16)
    }
  });
}
