import { useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { appFonts } from '@/constants/appFonts';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { pointsWorkCopy } from '@/constants/pointsWorkCopy';
import { bodyText } from '@/constants/appTypography';
import { figmaColors } from '@/constants/figmaColors';
import type { Href } from 'expo-router';

type Props = {
  s: (n: number) => number;
  t: (n: number) => number;
};

export function PointsActionLinks({ s, t }: Props) {
  const router = useRouter();
  const styles = useMemo(() => createStyles(s, t), [s, t]);

  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{pointsWorkCopy.actionsTitle}</Text>
      {pointsWorkCopy.actions.map((action) => (
        <Pressable
          key={action.key}
          style={({ pressed }) => [styles.btn, pressed && styles.btnPressed]}
          onPress={() => router.push(action.href as Href)}
          accessibilityRole="button"
        >
          <Text style={styles.btnText}>{action.label}</Text>
          <Ionicons name="chevron-forward" size={s(18)} color={figmaColors.charcoal} />
        </Pressable>
      ))}
    </View>
  );
}

function createStyles(s: (n: number) => number, t: (n: number) => number) {
  const tb = (n: number) => bodyText(t, n);

  return StyleSheet.create({
    wrap: {
      marginBottom: s(16)
    },
    title: {
      fontFamily: appFonts.accent,
      fontSize: tb(13),
      color: figmaColors.gray,
      letterSpacing: 1,
      textTransform: 'uppercase',
      marginBottom: s(8)
    },
    btn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: figmaColors.cream,
      borderWidth: 1,
      borderColor: figmaColors.borderStrong,
      borderRadius: s(12),
      paddingVertical: s(14),
      paddingHorizontal: s(14),
      marginBottom: s(8)
    },
    btnPressed: {
      opacity: 0.88
    },
    btnText: {
      fontFamily: appFonts.accent,
      fontSize: tb(14),
      color: figmaColors.charcoal,
      letterSpacing: 0.6
    }
  });
}
