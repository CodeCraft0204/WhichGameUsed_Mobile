import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  Image,
  StyleSheet,
  Text,
  View,
  useWindowDimensions
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { appFonts } from '@/constants/appFonts';
import { figmaColors } from '@/constants/figmaColors';

type Props = {
  /** 0–1 load progress */
  progress: number;
  message?: string;
};

const BAR_WIDTH_RATIO = 0.42;
const BAR_MAX_WIDTH = 220;
const BAR_HEIGHT = 22;
/** Strong warm dim at start — fades out as loading progresses */
const SPLASH_DIM_OPACITY = 0.5;
/** Parchment wash at start — extra muted/faded look that clears early */
const SPLASH_MUTE_OPACITY = 0.34;
/** Light cream lift near completion — matches main app parchment/cream surfaces */
const SPLASH_LIFT_OPACITY = 0.18;

export function AppSplashScreen({
  progress,
  message = 'Loading your research world…'
}: Props) {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const clamped = Math.max(0, Math.min(1, progress));
  const animated = useRef(new Animated.Value(clamped)).current;
  const barWidth = Math.min(width * BAR_WIDTH_RATIO, BAR_MAX_WIDTH);

  useEffect(() => {
    void SplashScreen.hideAsync().catch(() => {});
  }, []);

  useEffect(() => {
    Animated.timing(animated, {
      toValue: clamped,
      duration: 280,
      useNativeDriver: false
    }).start();
  }, [animated, clamped]);

  const fillWidth = animated.interpolate({
    inputRange: [0, 1],
    outputRange: [0, barWidth - 4]
  });

  const dimOverlayOpacity = animated.interpolate({
    inputRange: [0, 0.35, 1],
    outputRange: [SPLASH_DIM_OPACITY, SPLASH_DIM_OPACITY * 0.55, 0],
    extrapolate: 'clamp'
  });

  const muteOverlayOpacity = animated.interpolate({
    inputRange: [0, 0.55, 1],
    outputRange: [SPLASH_MUTE_OPACITY, 0, 0],
    extrapolate: 'clamp'
  });

  const liftOverlayOpacity = animated.interpolate({
    inputRange: [0, 0.55, 1],
    outputRange: [0, 0, SPLASH_LIFT_OPACITY],
    extrapolate: 'clamp'
  });

  const footerOpacity = animated.interpolate({
    inputRange: [0, 0.82, 1],
    outputRange: [1, 1, 0.72],
    extrapolate: 'clamp'
  });

  const styles = useMemo(
    () => createStyles(insets.bottom, barWidth),
    [insets.bottom, barWidth]
  );

  return (
    <View style={styles.root}>
      <StatusBar style="dark" translucent backgroundColor="transparent" />
      <Image
        source={require('@/assets/Splash.png')}
        style={[styles.image, { width, height }]}
        resizeMode="cover"
        accessibilityIgnoresInvertColors
        accessible
        accessibilityRole="image"
        accessibilityLabel="Which Game Used splash screen"
      />
      <Animated.View
        pointerEvents="none"
        style={[styles.brightnessOverlay, styles.dimOverlay, { opacity: dimOverlayOpacity }]}
      />
      <Animated.View
        pointerEvents="none"
        style={[styles.brightnessOverlay, styles.muteOverlay, { opacity: muteOverlayOpacity }]}
      />
      <Animated.View
        pointerEvents="none"
        style={[styles.brightnessOverlay, styles.liftOverlay, { opacity: liftOverlayOpacity }]}
      />
      <Animated.View style={[styles.footer, { opacity: footerOpacity }]} pointerEvents="none">
        <Text style={styles.message}>{message}</Text>
        <View
          style={styles.track}
          accessibilityRole="progressbar"
          accessibilityValue={{ min: 0, max: 100, now: Math.round(clamped * 100) }}
        >
          <Animated.View style={[styles.fill, { width: fillWidth }]} />
        </View>
      </Animated.View>
    </View>
  );
}

function createStyles(bottomInset: number, barWidth: number) {
  return StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: figmaColors.parchment,
      overflow: 'hidden'
    },
    image: {
      position: 'absolute',
      top: 0,
      left: 0
    },
    brightnessOverlay: {
      ...StyleSheet.absoluteFillObject
    },
    dimOverlay: {
      backgroundColor: figmaColors.black
    },
    muteOverlay: {
      backgroundColor: figmaColors.parchment
    },
    liftOverlay: {
      backgroundColor: figmaColors.creamLight
    },
    footer: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      alignItems: 'center',
      paddingBottom: Math.max(bottomInset, 28) + 36,
      paddingHorizontal: 32,
      backgroundColor: 'transparent'
    },
    message: {
      fontFamily: appFonts.body,
      fontSize: 16,
      lineHeight: 22,
      color: figmaColors.ink,
      textAlign: 'center',
      marginBottom: 14,
      letterSpacing: 0.15
    },
    track: {
      width: barWidth,
      height: BAR_HEIGHT,
      borderRadius: BAR_HEIGHT / 2,
      borderWidth: 1.5,
      borderColor: figmaColors.sepia,
      backgroundColor: 'transparent',
      overflow: 'hidden',
      justifyContent: 'center',
      paddingHorizontal: 2
    },
    fill: {
      height: BAR_HEIGHT - 6,
      borderRadius: (BAR_HEIGHT - 6) / 2,
      backgroundColor: figmaColors.black
    }
  });
}
