import React, { useMemo, useRef } from 'react';
import {
  Animated,
  Easing,
  PanResponder,
  StyleSheet,
  Text,
  View,
  type LayoutChangeEvent
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { appFonts } from '@/constants/appFonts';
import { bodyText } from '@/constants/appTypography';
import { figmaColors } from '@/constants/figmaColors';

type Props = {
  children: React.ReactNode;
  onDismiss: () => void;
  neverShow: boolean;
  s: (n: number) => number;
  t: (n: number) => number;
};

const SWIPE_THRESHOLD = 64;
const DISMISS_OFFSET = 420;

export function SwipeDismissAnnouncementRow({
  children,
  onDismiss,
  neverShow,
  s,
  t
}: Props) {
  const styles = useMemo(() => createStyles(s, t), [s, t]);
  const translateX = useRef(new Animated.Value(0)).current;
  const rowWidth = useRef(320);
  const dismissing = useRef(false);
  const onDismissRef = useRef(onDismiss);
  onDismissRef.current = onDismiss;

  const runDismiss = () => {
    if (dismissing.current) return;
    dismissing.current = true;

    Animated.timing(translateX, {
      toValue: rowWidth.current + 48,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true
    }).start(({ finished }) => {
      if (finished) onDismissRef.current();
    });
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gesture) =>
          !dismissing.current &&
          gesture.dx > 8 &&
          gesture.dx > Math.abs(gesture.dy) * 1.25,
        onMoveShouldSetPanResponderCapture: (_, gesture) =>
          !dismissing.current &&
          gesture.dx > 12 &&
          gesture.dx > Math.abs(gesture.dy) * 1.5,
        onPanResponderMove: (_, gesture) => {
          if (dismissing.current) return;
          translateX.setValue(Math.max(0, gesture.dx));
        },
        onPanResponderRelease: (_, gesture) => {
          if (dismissing.current) return;
          const shouldDismiss =
            gesture.dx >= SWIPE_THRESHOLD || gesture.vx > 0.45;
          if (shouldDismiss) {
            runDismiss();
            return;
          }
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 6,
            speed: 18
          }).start();
        },
        onPanResponderTerminate: () => {
          if (dismissing.current) return;
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
            bounciness: 6,
            speed: 18
          }).start();
        }
      }),
    [translateX]
  );

  const onLayout = (event: LayoutChangeEvent) => {
    rowWidth.current = event.nativeEvent.layout.width;
  };

  const underlayOpacity = translateX.interpolate({
    inputRange: [0, SWIPE_THRESHOLD * 0.35, SWIPE_THRESHOLD],
    outputRange: [0.35, 0.75, 1],
    extrapolate: 'clamp'
  });

  const cardScale = translateX.interpolate({
    inputRange: [0, SWIPE_THRESHOLD],
    outputRange: [1, 0.985],
    extrapolate: 'clamp'
  });

  return (
    <View style={styles.wrap} onLayout={onLayout}>
      <Animated.View style={[styles.underlay, { opacity: underlayOpacity }]}>
        <Ionicons
          name={neverShow ? 'eye-off-outline' : 'chevron-forward'}
          size={s(18)}
          color={figmaColors.textOnDark}
        />
        <Text style={styles.underlayText}>
          {neverShow ? 'Hide permanently' : 'Dismiss'}
        </Text>
      </Animated.View>

      <Animated.View
        style={[
          styles.cardWrap,
          {
            transform: [{ translateX }, { scale: cardScale }]
          }
        ]}
        {...panResponder.panHandlers}
      >
        {children}
      </Animated.View>
    </View>
  );
}

function createStyles(s: (n: number) => number, t: (n: number) => number) {
  const tb = (n: number) => bodyText(t, n);

  return StyleSheet.create({
    wrap: {
      position: 'relative',
      overflow: 'hidden',
      borderRadius: s(12)
    },
    underlay: {
      ...StyleSheet.absoluteFillObject,
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(8),
      paddingLeft: s(16),
      backgroundColor: figmaColors.sepia,
      borderRadius: s(12)
    },
    underlayText: {
      fontFamily: appFonts.body,
      fontSize: tb(13),
      lineHeight: tb(18),
      color: figmaColors.textOnDark,
      fontWeight: '600'
    },
    cardWrap: {
      borderRadius: s(12)
    }
  });
}
