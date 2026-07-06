import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { appFonts } from '@/constants/appFonts';
import { bodyText } from '@/constants/appTypography';
import { figmaColors } from '@/constants/figmaColors';
import { figmaSharedIcons } from '@/constants/figmaShared';

type Props = {
  title: string;
  s: (n: number) => number;
  t: (n: number) => number;
  onBack?: () => void;
  onCompose?: () => void;
  rightAction?: React.ReactNode;
};

export function MessagesHubHeader({ title, s, t, onBack, onCompose, rightAction }: Props) {
  const styles = useMemo(() => createStyles(s, t), [s, t]);

  return (
    <View style={styles.wrap}>
      <View style={styles.topRow}>
        {onBack ? (
          <Pressable
            onPress={onBack}
            style={styles.iconBtn}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            hitSlop={10}
          >
            <Ionicons name="arrow-back" size={s(24)} color={figmaColors.charcoal} />
          </Pressable>
        ) : (
          <View style={styles.iconBtn} />
        )}

        <Text style={styles.title}>{title}</Text>

        {rightAction ?? (
          onCompose ? (
            <Pressable
              onPress={onCompose}
              style={styles.iconBtn}
              accessibilityRole="button"
              accessibilityLabel="New message"
              hitSlop={10}
            >
              <Ionicons name="create-outline" size={s(24)} color={figmaColors.charcoal} />
            </Pressable>
          ) : (
            <View style={styles.iconBtn} />
          )
        )}
      </View>

      <Image source={figmaSharedIcons.titleBrush} style={styles.brush} resizeMode="stretch" />
    </View>
  );
}

function createStyles(s: (n: number) => number, t: (n: number) => number) {
  const tb = (n: number) => bodyText(t, n);

  return StyleSheet.create({
    wrap: {
      marginBottom: s(14)
    },
    topRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between'
    },
    iconBtn: {
      width: s(40),
      height: s(40),
      alignItems: 'center',
      justifyContent: 'center'
    },
    title: {
      flex: 1,
      textAlign: 'center',
      fontFamily: appFonts.display,
      fontSize: t(28),
      lineHeight: t(34),
      color: figmaColors.charcoal,
      letterSpacing: 1.2
    },
    brush: {
      width: '100%',
      height: s(18),
      marginTop: s(6)
    }
  });
}
