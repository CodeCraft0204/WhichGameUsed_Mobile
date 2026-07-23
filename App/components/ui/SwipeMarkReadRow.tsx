import React, { useMemo, useRef } from 'react';
import {
  Animated,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle
} from 'react-native';
import { appFonts } from '@/constants/appFonts';
import { figmaColors } from '@/constants/figmaColors';

const ACTION_WIDTH = 96;
const OPEN_THRESHOLD = 56;

type SwipeMarkReadRowProps = {
  enabled: boolean;
  onMarkRead: () => void;
  children: React.ReactNode;
  s: (n: number) => number;
  style?: StyleProp<ViewStyle>;
  actionLabel?: string;
  /** Background behind the swiped content (match list surface). */
  foregroundColor?: string;
};

/**
 * Swipe left to reveal a Mark read action. Disabled when `enabled` is false.
 */
export function SwipeMarkReadRow({
  enabled,
  onMarkRead,
  children,
  s,
  style,
  actionLabel = 'Mark read',
  foregroundColor = figmaColors.background
}: SwipeMarkReadRowProps) {
  const styles = useMemo(() => createStyles(s), [s]);
  const translateX = useRef(new Animated.Value(0)).current;
  const startX = useRef(0);

  const close = () => {
    Animated.spring(translateX, {
      toValue: 0,
      useNativeDriver: true,
      bounciness: 0,
      speed: 20
    }).start();
  };

  const open = () => {
    Animated.spring(translateX, {
      toValue: -ACTION_WIDTH,
      useNativeDriver: true,
      bounciness: 0,
      speed: 20
    }).start();
  };

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gesture) => {
          if (!enabled) return false;
          return Math.abs(gesture.dx) > 8 && Math.abs(gesture.dx) > Math.abs(gesture.dy);
        },
        onPanResponderGrant: () => {
          translateX.stopAnimation((value) => {
            startX.current = typeof value === 'number' ? value : 0;
          });
        },
        onPanResponderMove: (_, gesture) => {
          const next = Math.min(0, Math.max(-ACTION_WIDTH, startX.current + gesture.dx));
          translateX.setValue(next);
        },
        onPanResponderRelease: (_, gesture) => {
          const projected = startX.current + gesture.dx;
          if (projected < -OPEN_THRESHOLD || gesture.vx < -0.4) open();
          else close();
        },
        onPanResponderTerminate: () => close()
      }),
    [enabled, translateX]
  );

  if (!enabled) {
    return <View style={style}>{children}</View>;
  }

  return (
    <View style={[styles.wrap, style]}>
      <View style={styles.actionTrack}>
        <Pressable
          style={styles.actionBtn}
          onPress={() => {
            close();
            onMarkRead();
          }}
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
        >
          <Text style={styles.actionText}>{actionLabel}</Text>
        </Pressable>
      </View>
      <Animated.View
        style={[
          styles.foreground,
          { backgroundColor: foregroundColor, transform: [{ translateX }] }
        ]}
        {...panResponder.panHandlers}
      >
        {children}
      </Animated.View>
    </View>
  );
}

function createStyles(s: (n: number) => number) {
  return StyleSheet.create({
    wrap: {
      position: 'relative',
      overflow: 'hidden'
    },
    actionTrack: {
      ...StyleSheet.absoluteFillObject,
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'stretch',
      backgroundColor: figmaColors.navActive
    },
    actionBtn: {
      width: ACTION_WIDTH,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: s(8)
    },
    actionText: {
      fontFamily: appFonts.accent,
      fontSize: s(13),
      color: figmaColors.textOnDark,
      textAlign: 'center',
      letterSpacing: 0.3
    },
    foreground: {
      backgroundColor: figmaColors.background
    }
  });
}
