import React, { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ProfileAvatar } from '@/components/profile/ProfileAvatar';
import { appFonts } from '@/constants/appFonts';
import { figmaColors } from '@/constants/figmaColors';
import { bodyText } from '@/constants/appTypography';

type SocialUserRowProps = {
  userId: string;
  displayName: string;
  avatarUrl: string | null;
  subtitle?: string;
  onPress: () => void;
  s: (n: number) => number;
  t: (n: number) => number;
};

export function SocialUserRow({
  displayName,
  avatarUrl,
  subtitle,
  onPress,
  s,
  t
}: SocialUserRowProps) {
  const styles = useMemo(() => createStyles(s, t), [s, t]);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      accessibilityRole="button"
    >
      <ProfileAvatar url={avatarUrl} name={displayName} size={s(44)} />
      <View style={styles.textCol}>
        <Text style={styles.name}>{displayName}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
    </Pressable>
  );
}

function createStyles(s: (n: number) => number, t: (n: number) => number) {
  const tb = (n: number) => bodyText(t, n);
  return StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(12),
      paddingVertical: s(10),
      borderBottomWidth: 1,
      borderBottomColor: figmaColors.divider
    },
    pressed: { opacity: 0.85 },
    textCol: { flex: 1, minWidth: 0, gap: s(2) },
    name: {
      fontFamily: appFonts.bodyBold,
      fontSize: tb(17),
      color: figmaColors.charcoal
    },
    subtitle: {
      fontFamily: appFonts.body,
      fontSize: tb(14),
      color: figmaColors.gray
    }
  });
}
