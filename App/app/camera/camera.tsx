import React from 'react';
import { Link } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radius, spacing } from '@/constants/theme';

export default function CameraScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.root}>
        <View style={styles.topBar}>
          <Pressable style={styles.smallBtn}><Text style={styles.smallBtnText}>X</Text></Pressable>
          <Text style={styles.logo}>WHICH</Text>
          <Pressable style={styles.smallBtn}><Text style={styles.smallBtnText}>Flash</Text></Pressable>
        </View>

        <View style={styles.guideWrap}>
          <View style={styles.guideBox} />
          <Text style={styles.guideText}>Center card inside frame</Text>
        </View>

        <View style={styles.bottomTools}>
          <Pressable style={styles.tool}><Text style={styles.toolText}>Zoom</Text></Pressable>
          <Pressable style={styles.capture}><View style={styles.captureInner} /></Pressable>
          <Pressable style={styles.tool}><Text style={styles.toolText}>Flip</Text></Pressable>
        </View>

        <Link asChild href="/database/database">
          <Pressable style={styles.backButton}>
            <Text style={styles.backText}>Back to App</Text>
          </Pressable>
        </Link>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#17181a'
  },
  root: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    justifyContent: 'space-between'
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  smallBtn: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.45)',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: 'rgba(255,255,255,0.12)'
  },
  smallBtnText: {
    color: '#F1F2F3',
    fontWeight: '700',
    fontSize: 12
  },
  logo: {
    color: '#F1F2F3',
    fontWeight: '800',
    letterSpacing: 1.5,
    fontSize: 18
  },
  guideWrap: {
    alignItems: 'center',
    gap: spacing.sm
  },
  guideBox: {
    width: '86%',
    aspectRatio: 0.72,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.75)',
    borderRadius: radius.md
  },
  guideText: {
    color: '#D4D7DA',
    fontSize: 13
  },
  bottomTools: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly'
  },
  tool: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.1)'
  },
  toolText: {
    color: '#F2F3F4',
    fontWeight: '600'
  },
  capture: {
    width: 84,
    height: 84,
    borderRadius: 42,
    borderWidth: 3,
    borderColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)'
  },
  captureInner: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: '#ffffff'
  },
  backButton: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    borderRadius: radius.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs
  },
  backText: {
    color: colors.white,
    fontWeight: '600'
  }
});
