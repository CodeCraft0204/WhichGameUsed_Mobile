import { useRouter } from 'expo-router';
import React from 'react';
import { Image, Pressable, StyleSheet, View } from 'react-native';
import { figmaColors } from '@/constants/figmaColors';
import { figmaSharedIcons } from '@/constants/figmaShared';

type FigmaUtilityBarProps = {
  s: (n: number) => number;
};

export function FigmaUtilityBar({ s }: FigmaUtilityBarProps) {
  const router = useRouter();
  const styles = createStyles(s);

  return (
    <View style={styles.utilityBar}>
      <Pressable
        style={styles.utilityBtn}
        accessibilityRole="button"
        accessibilityLabel="Search"
      >
        <Image source={figmaSharedIcons.utilitySearch} style={styles.utilityIcon} resizeMode="contain" />
      </Pressable>
      <Pressable
        style={styles.utilityBtn}
        accessibilityRole="button"
        accessibilityLabel="Profile"
        onPress={() => router.push('/profile/profile')}
      >
        <Image source={figmaSharedIcons.utilityProfile} style={styles.utilityIcon} resizeMode="contain" />
      </Pressable>
      <Pressable
        style={styles.utilityBtn}
        accessibilityRole="button"
        accessibilityLabel="Settings"
        onPress={() => router.push('/settings/settings')}
      >
        <Image source={figmaSharedIcons.utilitySettings} style={styles.utilityIcon} resizeMode="contain" />
      </Pressable>
    </View>
  );
}

function createStyles(s: (n: number) => number) {
  return StyleSheet.create({
    utilityBar: {
      position: 'absolute',
      right: 0,
      top: s(28),
      width: s(84),
      height: s(263),
      borderRadius: s(18),
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      backgroundColor: figmaColors.utilityBar,
      alignItems: 'center',
      justifyContent: 'space-evenly'
    },
    utilityBtn: {
      padding: s(4)
    },
    utilityIcon: {
      width: s(40),
      height: s(40)
    }
  });
}
