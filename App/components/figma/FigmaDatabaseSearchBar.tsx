import React from 'react';
import { Image, StyleSheet, TextInput, View } from 'react-native';
import { databaseCopy } from '@/constants/databaseContent';
import { figmaColors } from '@/constants/figmaColors';
import { figmaIcons } from '@/constants/figmaIcons';

type FigmaDatabaseSearchBarProps = {
  s: (n: number) => number;
  t: (n: number) => number;
  value: string;
  onChangeText: (text: string) => void;
};

export function FigmaDatabaseSearchBar({ s, t, value, onChangeText }: FigmaDatabaseSearchBarProps) {
  const styles = createStyles(s, t);

  return (
    <View style={styles.wrap}>
      <View style={styles.bar}>
        <Image source={figmaIcons.utilitySearch} style={styles.icon} resizeMode="contain" />
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={databaseCopy.searchPlaceholder}
          placeholderTextColor={figmaColors.textMuted}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="search"
          clearButtonMode="while-editing"
        />
      </View>
    </View>
  );
}

function createStyles(s: (n: number) => number, t: (n: number) => number) {
  return StyleSheet.create({
    wrap: {
      marginTop: s(18),
      width: '100%'
    },
    bar: {
      minHeight: s(48),
      borderRadius: s(24),
      borderWidth: 1,
      borderColor: figmaColors.tabInactiveBorder,
      backgroundColor: figmaColors.utilityBar,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: s(14),
      gap: s(10)
    },
    icon: {
      width: s(22),
      height: s(22)
    },
    input: {
      flex: 1,
      fontFamily: 'EBGaramond_600SemiBold',
      fontSize: t(16),
      lineHeight: t(22),
      color: figmaColors.charcoal,
      paddingVertical: s(8)
    }
  });
}
