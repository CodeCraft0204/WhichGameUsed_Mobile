import React, { useMemo } from 'react';
import { appFonts } from '@/constants/appFonts';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { figmaColors } from '@/constants/figmaColors';
import { profileInitials } from '@/lib/profile';

type ProfileAvatarProps = {
  url: string | null;
  name: string;
  size: number;
  onPress?: () => void;
  disabled?: boolean;
};

export function ProfileAvatar({ url, name, size, onPress, disabled }: ProfileAvatarProps) {
  const styles = useMemo(() => createStyles(size), [size]);
  const initials = profileInitials(name);

  const content = url ? (
    <Image source={{ uri: url }} style={styles.image} resizeMode="cover" />
  ) : (
    <View style={styles.fallback}>
      <Text style={styles.initials}>{initials || '?'}</Text>
    </View>
  );

  if (!onPress) {
    return <View style={styles.wrap}>{content}</View>;
  }

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [styles.wrap, pressed && styles.pressed]}
      accessibilityRole="button"
      accessibilityLabel="Change profile photo"
    >
      {content}
    </Pressable>
  );
}

function createStyles(size: number) {
  return StyleSheet.create({
    wrap: {
      width: size,
      height: size,
      borderRadius: size / 2,
      borderWidth: 2,
      borderColor: figmaColors.borderStrong,
      overflow: 'hidden',
      backgroundColor: figmaColors.surfaceElevated
    },
    pressed: {
      opacity: 0.9
    },
    image: {
      width: '100%',
      height: '100%'
    },
    fallback: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: figmaColors.surfaceMuted
    },
    initials: {
      fontFamily: appFonts.body,
      fontSize: Math.round(size * 0.34),
      color: figmaColors.charcoal
    }
  });
}
