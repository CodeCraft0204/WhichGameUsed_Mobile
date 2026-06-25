import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, LayoutChangeEvent, StyleSheet, Text, View } from 'react-native';
import { appFonts } from '@/constants/appFonts';
import { bodyText } from '@/constants/appTypography';
import { figmaColors } from '@/constants/figmaColors';
import { useFigmaLayout } from '@/hooks/useFigmaLayout';

type Props = {
  text: string;
};

export function AnnouncementMarquee({ text }: Props) {
  const { s, t } = useFigmaLayout();
  const styles = useMemo(() => createStyles(s, t), [s, t]);
  const translateX = useRef(new Animated.Value(0)).current;
  const [containerWidth, setContainerWidth] = useState(0);
  const [textWidth, setTextWidth] = useState(0);
  const trimmed = text.trim();
  const shouldScroll = trimmed.length > 0 && textWidth > containerWidth && containerWidth > 0;

  useEffect(() => {
    translateX.stopAnimation();
    translateX.setValue(0);

    if (!shouldScroll) return;

    const distance = textWidth + s(32);
    const duration = Math.max(9000, distance * 30);

    const anim = Animated.loop(
      Animated.timing(translateX, {
        toValue: -distance,
        duration,
        easing: Easing.linear,
        useNativeDriver: true
      })
    );

    anim.start();
    return () => anim.stop();
  }, [shouldScroll, s, textWidth, translateX]);

  if (!trimmed) return null;

  const loopText = shouldScroll ? `${trimmed}   ·   ${trimmed}` : trimmed;

  return (
    <View style={styles.row}>
      <View style={styles.clip} onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}>
        <Animated.Text
          style={[styles.text, shouldScroll && { transform: [{ translateX }] }]}
          onLayout={(e) => setTextWidth(e.nativeEvent.layout.width / (shouldScroll ? 2 : 1))}
          numberOfLines={1}
        >
          {loopText}
        </Animated.Text>
      </View>
      {shouldScroll ? <View style={styles.fadeRight} pointerEvents="none" /> : null}
    </View>
  );
}

function createStyles(s: (n: number) => number, t: (n: number) => number) {
  const tb = (n: number) => bodyText(t, n);

  return StyleSheet.create({
    row: {
      position: 'relative',
      width: '100%'
    },
    clip: {
      overflow: 'hidden',
      width: '100%'
    },
    text: {
      fontFamily: appFonts.body,
      fontSize: tb(13),
      lineHeight: tb(18),
      color: figmaColors.textSecondary
    },
    fadeRight: {
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      width: s(28),
      backgroundColor: 'rgba(242, 235, 220, 0.92)'
    }
  });
}
