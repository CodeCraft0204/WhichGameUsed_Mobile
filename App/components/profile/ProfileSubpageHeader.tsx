import { Ionicons } from '@expo/vector-icons';
import { appFonts } from '@/constants/appFonts';
import { bodyText, broadsheetAccent } from '@/constants/appTypography';
import React, { useMemo } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { figmaColors } from '@/constants/figmaColors';
import { figmaSharedIcons } from '@/constants/figmaShared';

type ProfileSubpageHeaderProps = {
  title: string;
  subtitle?: string;
  description?: string;
  s: (n: number) => number;
  t: (n: number) => number;
  onBack: () => void;
};

export function ProfileSubpageHeader({
  title,
  subtitle,
  description,
  s,
  t,
  onBack
}: ProfileSubpageHeaderProps) {
  const styles = useMemo(() => createStyles(s, t), [s, t]);

  return (
    <View style={styles.wrap}>
      <Pressable
        onPress={onBack}
        style={styles.backBtn}
        accessibilityRole="button"
        accessibilityLabel="Go back"
        hitSlop={12}
      >
        <Ionicons name="arrow-back" size={s(26)} color={figmaColors.charcoal} />
      </Pressable>
      <Text style={styles.title}>{title}</Text>
      <Image source={figmaSharedIcons.titleBrush} style={styles.brush} resizeMode="stretch" />
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      {description ? <Text style={styles.description}>{description}</Text> : null}
    </View>
  );
}

function createStyles(s: (n: number) => number, t: (n: number) => number) {
  const tb = (n: number) => bodyText(t, n);

  return StyleSheet.create({
    wrap: {
      marginBottom: s(18)
    },
    backBtn: {
      width: s(44),
      height: s(44),
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: s(4),
      marginLeft: s(-8)
    },
    title: {
      fontFamily: appFonts.display,
      fontSize: t(42),
      lineHeight: t(52),
      color: figmaColors.charcoal,
      letterSpacing: 0.5,
      transform: [{ rotate: '-3deg' }]
    },
    brush: {
      width: s(300),
      height: s(28),
      marginTop: s(-10),
      marginLeft: s(2)
    },
    subtitle: {
      marginTop: s(16),
      fontFamily: appFonts.body,
      fontSize: tb(20),
      lineHeight: tb(26),
      color: figmaColors.gray,
      ...broadsheetAccent
    },
    description: {
      marginTop: s(12),
      fontFamily: appFonts.body,
      fontSize: tb(20),
      lineHeight: tb(26),
      color: figmaColors.textSecondary
    }
  });
}
