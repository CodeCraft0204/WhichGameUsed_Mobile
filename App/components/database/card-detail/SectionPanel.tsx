import React, { useMemo } from 'react';
import { StyleSheet, Text, View, type ViewProps } from 'react-native';
import { appFonts } from '@/constants/appFonts';
import { bodyText } from '@/constants/appTypography';
import { figmaColors } from '@/constants/figmaColors';

type SectionPanelProps = ViewProps & {
  title: string;
  subtitle?: string;
  s: (n: number) => number;
  t: (n: number) => number;
  children: React.ReactNode;
};

export function SectionPanel({
  title,
  subtitle,
  s,
  t,
  children,
  style,
  ...rest
}: SectionPanelProps) {
  const styles = useMemo(() => createStyles(s, t), [s, t]);

  return (
    <View style={[styles.wrap, style]} {...rest}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      <View style={styles.card}>{children}</View>
    </View>
  );
}

function createStyles(s: (n: number) => number, t: (n: number) => number) {
  const tb = (n: number) => bodyText(t, n);
  return StyleSheet.create({
    wrap: { marginBottom: s(24) },
    header: { marginBottom: s(10), gap: s(4) },
    title: {
      fontFamily: appFonts.display,
      fontSize: t(22),
      color: figmaColors.charcoal,
      letterSpacing: 0.4
    },
    subtitle: {
      fontFamily: appFonts.body,
      fontSize: tb(14),
      color: figmaColors.textMuted,
      lineHeight: tb(20)
    },
    card: {
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      borderRadius: s(14),
      padding: s(16),
      backgroundColor: figmaColors.cream,
      shadowColor: figmaColors.black,
      shadowOffset: { width: 0, height: s(2) },
      shadowOpacity: 0.06,
      shadowRadius: s(6),
      elevation: 2,
      gap: s(4)
    }
  });
}
