import React from 'react';
import { ScrollView, StyleSheet, View, type ScrollViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { figmaColors } from '@/constants/figmaColors';

type FigmaScreenProps = {
  backgroundColor?: string;
  scrollProps?: ScrollViewProps;
  bottomNav?: React.ReactNode;
  children: React.ReactNode;
};

export function FigmaScreen({
  backgroundColor = figmaColors.background,
  scrollProps,
  bottomNav,
  children
}: FigmaScreenProps) {
  return (
    <SafeAreaView style={[styles.safe, { backgroundColor }]} edges={['top', 'left', 'right']}>
      <View style={styles.body}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          {...scrollProps}
          style={styles.scroll}
          contentContainerStyle={[styles.scrollContent, scrollProps?.contentContainerStyle]}
        >
          {children}
        </ScrollView>
        {bottomNav ? (
          <SafeAreaView edges={['bottom']} style={styles.bottomSafe}>
            {bottomNav}
          </SafeAreaView>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1
  },
  body: {
    flex: 1
  },
  scroll: {
    flex: 1
  },
  scrollContent: {
    flexGrow: 1
  },
  bottomSafe: {
    backgroundColor: figmaColors.bottomNav
  }
});
