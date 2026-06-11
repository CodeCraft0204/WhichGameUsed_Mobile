import React, { useMemo } from 'react';
import { StyleSheet, Text, View, type ViewProps } from 'react-native';
import { figmaColors } from '@/constants/figmaColors';

type ProfileSectionProps = ViewProps & {
  title: string;
  s: (n: number) => number;
  t: (n: number) => number;
  children: React.ReactNode;
};

export function ProfileSection({ title, s, t, children, style, ...viewProps }: ProfileSectionProps) {
  const styles = useMemo(() => createStyles(s, t), [s, t]);

  return (
    <View style={[styles.card, style]} {...viewProps}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.body}>{children}</View>
    </View>
  );
}

function createStyles(s: (n: number) => number, t: (n: number) => number) {
  return StyleSheet.create({
    card: {
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      borderRadius: s(14),
      backgroundColor: figmaColors.surface,
      padding: s(16),
      gap: s(14)
    },
    title: {
      fontFamily: 'PermanentMarker_400Regular',
      fontSize: t(24),
      color: figmaColors.charcoal,
      letterSpacing: 0.4
    },
    body: {
      gap: s(16)
    }
  });
}
