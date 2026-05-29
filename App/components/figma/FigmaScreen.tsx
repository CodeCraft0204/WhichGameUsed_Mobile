import React from 'react';
import { ScrollView, StyleSheet, View, type ScrollViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type FigmaScreenProps = {
  backgroundColor?: string;
  scrollProps?: ScrollViewProps;
  bottomNav: React.ReactNode;
  children: React.ReactNode;
};

export function FigmaScreen({
  backgroundColor = '#f6f4f0',
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
        <SafeAreaView edges={['bottom']} style={styles.bottomSafe}>
          {bottomNav}
        </SafeAreaView>
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
    backgroundColor: '#f7f5f3'
  }
});
