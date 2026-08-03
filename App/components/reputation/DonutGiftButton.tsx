import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { ResponseGifOverlay } from '@/components/ui/ResponseGifOverlay';
import { appFonts } from '@/constants/appFonts';
import { figmaColors } from '@/constants/figmaColors';
import { reputationCopy } from '@/constants/reputationCopy';
import { reputationUiImages } from '@/constants/reputationContent';
import { giftDonut } from '@/lib/reputation';

export function DonutGiftButton({
  toUserId,
  targetType,
  targetId,
  disabled,
  s,
  t,
  onGifted
}: {
  toUserId: string;
  targetType: string;
  targetId: string;
  disabled?: boolean;
  s: (n: number) => number;
  t: (n: number) => number;
  onGifted?: () => void;
}) {
  const styles = useMemo(() => createStyles(s, t), [s, t]);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [showGif, setShowGif] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scale = useRef(new Animated.Value(1)).current;
  const pop = useRef(new Animated.Value(0)).current;

  const playGiftAnimation = useCallback(() => {
    pop.setValue(0);
    Animated.parallel([
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.18, duration: 160, useNativeDriver: true }),
        Animated.spring(scale, { toValue: 1, friction: 4, useNativeDriver: true })
      ]),
      Animated.sequence([
        Animated.timing(pop, { toValue: 1, duration: 220, useNativeDriver: true }),
        Animated.timing(pop, { toValue: 0, duration: 420, useNativeDriver: true })
      ])
    ]).start();
  }, [pop, scale]);

  useEffect(() => {
    if (done) playGiftAnimation();
  }, [done, playGiftAnimation]);

  const onPress = useCallback(async () => {
    if (busy || done || disabled) return;
    setBusy(true);
    setError(null);
    const res = await giftDonut({ toUserId, targetType, targetId });
    setBusy(false);
    if (res.error) {
      setError(res.error);
      return;
    }
    setDone(true);
    setShowGif(true);
    onGifted?.();
  }, [busy, disabled, done, onGifted, targetId, targetType, toUserId]);

  return (
    <View style={styles.wrap}>
      <Animated.View style={{ transform: [{ scale }] }}>
        <Pressable
          onPress={() => void onPress()}
          disabled={busy || done || disabled}
          style={({ pressed }) => [
            styles.btn,
            (busy || done || disabled) && styles.disabled,
            pressed && !busy && !done ? styles.pressed : null
          ]}
          accessibilityRole="button"
          accessibilityLabel={reputationCopy.giveDonut}
        >
          <Image source={reputationUiImages.donut} style={styles.icon} resizeMode="contain" />
          <Text style={styles.text}>
            {done
              ? reputationCopy.giveDonutDone
              : busy
                ? reputationCopy.giveDonutBusy
                : reputationCopy.giveDonut}
          </Text>
        </Pressable>
      </Animated.View>
      <Animated.View
        pointerEvents="none"
        style={[
          styles.burst,
          {
            opacity: pop,
            transform: [
              {
                translateY: pop.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -28]
                })
              },
              {
                scale: pop.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.6, 1.15]
                })
              }
            ]
          }
        ]}
      >
        <Image source={reputationUiImages.donut} style={styles.burstIcon} resizeMode="contain" />
      </Animated.View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <ResponseGifOverlay visible={showGif} onDone={() => setShowGif(false)} mood="success" />
    </View>
  );
}

function createStyles(s: (n: number) => number, t: (n: number) => number) {
  return StyleSheet.create({
    wrap: { alignSelf: 'flex-start', position: 'relative' },
    btn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(6),
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      backgroundColor: figmaColors.tagBg,
      borderRadius: s(8),
      paddingHorizontal: s(10),
      paddingVertical: s(6)
    },
    icon: { width: s(20), height: s(20) },
    pressed: { opacity: 0.88 },
    disabled: { opacity: 0.55 },
    text: {
      fontFamily: appFonts.accent,
      fontSize: t(11),
      letterSpacing: 0.4,
      color: figmaColors.brown
    },
    burst: {
      position: 'absolute',
      left: s(4),
      top: s(-4)
    },
    burstIcon: { width: s(28), height: s(28) },
    error: {
      marginTop: s(4),
      fontFamily: appFonts.body,
      fontSize: t(10),
      color: figmaColors.error
    }
  });
}
