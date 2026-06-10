import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { figmaColors } from '@/constants/figmaColors';
import { figmaSharedIcons } from '@/constants/figmaShared';

type FigmaUtilityBarProps = {
  s: (n: number) => number;
};

export function FigmaUtilityBar({ s }: FigmaUtilityBarProps) {
  const styles = createStyles(s);

  return (
    <View style={styles.utilityBar}>
      <Image source={figmaSharedIcons.utilitySearch} style={styles.utilityIcon} resizeMode="contain" />
      <Image source={figmaSharedIcons.utilityProfile} style={styles.utilityIcon} resizeMode="contain" />
      <Image source={figmaSharedIcons.utilitySettings} style={styles.utilityIcon} resizeMode="contain" />
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
    utilityIcon: {
      width: s(40),
      height: s(40)
    }
  });
}
