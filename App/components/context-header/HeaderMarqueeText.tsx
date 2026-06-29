import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type TextStyle
} from 'react-native';

type Props = {
  text: string;
  style?: StyleProp<TextStyle>;
  maxHeight: number;
  active?: boolean;
};

const PAUSE_MS = 1400;
const SCROLL_MS_PER_PX = 28;
const RESET_MS = 500;

/** Vertically auto-scrolls overflowing header copy inside a fixed-height clip. */
export function HeaderMarqueeText({ text, style, maxHeight, active = true }: Props) {
  const scrollY = useRef(new Animated.Value(0)).current;
  const [contentHeight, setContentHeight] = useState(0);
  const needsMarquee = active && contentHeight > maxHeight + 1;

  useEffect(() => {
    scrollY.stopAnimation();
    scrollY.setValue(0);
    if (!needsMarquee) return;

    const distance = contentHeight - maxHeight;
    const scrollMs = Math.max(2400, distance * SCROLL_MS_PER_PX);
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(PAUSE_MS),
        Animated.timing(scrollY, { toValue: -distance, duration: scrollMs, useNativeDriver: true }),
        Animated.delay(PAUSE_MS),
        Animated.timing(scrollY, { toValue: 0, duration: RESET_MS, useNativeDriver: true })
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [contentHeight, maxHeight, needsMarquee, scrollY, text]);

  return (
    <View style={[styles.clip, { height: maxHeight }]}>
      <Animated.View style={needsMarquee ? { transform: [{ translateY: scrollY }] } : undefined}>
        <Text
          style={style}
          onTextLayout={(event) => {
            const measured = event.nativeEvent.lines.reduce((sum, line) => sum + line.height, 0);
            if (measured > 0) setContentHeight(Math.ceil(measured));
          }}
        >
          {text}
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  clip: { width: '100%', overflow: 'hidden' }
});
