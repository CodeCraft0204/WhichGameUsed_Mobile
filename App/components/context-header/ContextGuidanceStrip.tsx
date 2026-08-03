import { useRouter, type Href } from 'expo-router';
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle
} from 'react-native';
import { appFonts } from '@/constants/appFonts';
import { bodyText } from '@/constants/appTypography';
import {
  type ContextHeaderMessage,
  type ContextHeaderPageKey
} from '@/constants/contextHeaderContent';
import { figmaColors } from '@/constants/figmaColors';
import { useContextHeaderScroll } from '@/context/ContextHeaderScrollContext';
import { useContextHeaderMessages } from '@/hooks/useContextHeaderMessages';
import { useFigmaLayout } from '@/hooks/useFigmaLayout';
import {
  isContextHeaderDismissed,
  subscribeContextHeaderSession
} from '@/lib/context-header-session';

type Props = {
  pageKey: ContextHeaderPageKey;
  fallbackDescription?: string;
  /** Page-header layout: hug current text, no min-height reservation. */
  headerMode?: boolean;
  style?: StyleProp<TextStyle>;
  containerStyle?: StyleProp<ViewStyle>;
};

/** Page description stays visible longer before tip rotation begins. */
const INTRO_DELAY_MS = 7500;
/** Dwell time per rotating tip — client ask: increase display time on each page. */
const MESSAGE_CYCLE_MS = 10000;
const FADE_MS = 260;
const SCROLL_DESCRIPTION_THRESHOLD = 12;
const SWIPE_THRESHOLD = 40;

type ContentMode = 'description' | 'tips';
type Phase = 'intro' | 'tips';

function ContextGuidanceStripComponent({
  pageKey,
  fallbackDescription,
  headerMode = false,
  style,
  containerStyle
}: Props) {
  const router = useRouter();
  const { s, t } = useFigmaLayout();
  const scrollCtx = useContextHeaderScroll();
  const { messages } = useContextHeaderMessages(pageKey);
  const styles = useMemo(() => createStyles(s, t, headerMode), [s, t, headerMode]);
  const tips = messages.filter((m) => m.text);
  const hasIntro = Boolean(fallbackDescription?.trim());
  const [dismissed, setDismissed] = useState(() => isContextHeaderDismissed(pageKey));
  const [phase, setPhase] = useState<Phase>(() =>
    isContextHeaderDismissed(pageKey) || !fallbackDescription?.trim() ? 'tips' : 'intro'
  );
  const [messageIndex, setMessageIndex] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [contentMode, setContentMode] = useState<ContentMode>(hasIntro ? 'description' : 'tips');
  const [reservedHeight, setReservedHeight] = useState(0);

  const contentOpacity = useRef(new Animated.Value(1)).current;
  const messageIndexRef = useRef(messageIndex);
  const scrolledRef = useRef(false);
  const heightsRef = useRef({ description: 0, tipMax: 0 });
  const transitionRef = useRef(false);

  messageIndexRef.current = messageIndex;

  const targetMode: ContentMode = useMemo(() => {
    const showTips = !dismissed && !isScrolled && phase === 'tips' && tips.length > 0;
    if (showTips) return 'tips';
    if (hasIntro) return 'description';
    return tips.length > 0 ? 'tips' : 'description';
  }, [dismissed, hasIntro, isScrolled, tips.length, phase]);

  useEffect(() => {
    const isDismissed = isContextHeaderDismissed(pageKey);
    setDismissed(isDismissed);
    setPhase(isDismissed || !fallbackDescription?.trim() ? 'tips' : 'intro');
    return subscribeContextHeaderSession(() => {
      const nextDismissed = isContextHeaderDismissed(pageKey);
      setDismissed(nextDismissed);
      if (nextDismissed) setPhase('tips');
    });
  }, [fallbackDescription, pageKey]);

  useEffect(() => {
    setMessageIndex(0);
    contentOpacity.setValue(1);
    scrolledRef.current = false;
    setIsScrolled(false);
    setReservedHeight(0);
    heightsRef.current = { description: 0, tipMax: 0 };
    setContentMode(hasIntro ? 'description' : 'tips');
    if (!isContextHeaderDismissed(pageKey) && fallbackDescription?.trim()) {
      setPhase('intro');
    }
  }, [contentOpacity, fallbackDescription, hasIntro, pageKey]);

  useEffect(() => {
    if (!scrollCtx) return;
    const id = scrollCtx.scrollY.addListener(({ value }) => {
      const nextScrolled = value > SCROLL_DESCRIPTION_THRESHOLD;
      if (nextScrolled !== scrolledRef.current) {
        scrolledRef.current = nextScrolled;
        setIsScrolled(nextScrolled);
      }
    });
    return () => scrollCtx.scrollY.removeListener(id);
  }, [scrollCtx]);

  const fadeContent = useCallback(
    (onMidpoint: () => void) => {
      if (transitionRef.current) return;
      transitionRef.current = true;
      Animated.timing(contentOpacity, {
        toValue: 0,
        duration: FADE_MS,
        useNativeDriver: true
      }).start(({ finished }) => {
        if (!finished) {
          transitionRef.current = false;
          return;
        }
        onMidpoint();
        Animated.timing(contentOpacity, {
          toValue: 1,
          duration: FADE_MS,
          useNativeDriver: true
        }).start(() => {
          transitionRef.current = false;
        });
      });
    },
    [contentOpacity]
  );

  useEffect(() => {
    if (contentMode === targetMode) return;
    fadeContent(() => setContentMode(targetMode));
  }, [contentMode, fadeContent, targetMode]);

  const fadeToMessage = useCallback(
    (nextIndex: number) => {
      fadeContent(() => setMessageIndex(nextIndex));
    },
    [fadeContent]
  );

  const goNext = useCallback(() => {
    if (tips.length <= 1 || contentMode !== 'tips') return;
    fadeToMessage((messageIndex + 1) % tips.length);
  }, [contentMode, fadeToMessage, messageIndex, tips.length]);

  const goPrev = useCallback(() => {
    if (tips.length <= 1 || contentMode !== 'tips') return;
    fadeToMessage((messageIndex - 1 + tips.length) % tips.length);
  }, [contentMode, fadeToMessage, messageIndex, tips.length]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gesture) =>
          contentMode === 'tips' &&
          Math.abs(gesture.dx) > 10 &&
          Math.abs(gesture.dx) > Math.abs(gesture.dy) * 1.2,
        onPanResponderRelease: (_, gesture) => {
          if (gesture.dx <= -SWIPE_THRESHOLD) goNext();
          else if (gesture.dx >= SWIPE_THRESHOLD) goPrev();
        }
      }),
    [contentMode, goNext, goPrev]
  );

  useEffect(() => {
    if (dismissed || phase !== 'intro' || !hasIntro || isScrolled) return;
    const id = setTimeout(() => {
      setPhase('tips');
      setMessageIndex(0);
    }, INTRO_DELAY_MS);
    return () => clearTimeout(id);
  }, [dismissed, hasIntro, isScrolled, phase]);

  useEffect(() => {
    if (contentMode !== 'tips' || tips.length <= 1 || dismissed || isScrolled) return;
    const id = setInterval(() => {
      const next = (messageIndexRef.current + 1) % tips.length;
      fadeToMessage(next);
    }, MESSAGE_CYCLE_MS);
    return () => clearInterval(id);
  }, [contentMode, dismissed, fadeToMessage, isScrolled, tips.length]);

  const activeMessage: ContextHeaderMessage | undefined = tips[messageIndex] ?? tips[0];
  const displayText =
    contentMode === 'tips'
      ? activeMessage?.text ?? ''
      : fallbackDescription ?? activeMessage?.text ?? '';

  const tipRoute = contentMode === 'tips' ? activeMessage?.route : undefined;

  const openRoute = useCallback(() => {
    if (!tipRoute) return;
    router.push(tipRoute as Href);
  }, [router, tipRoute]);

  const registerHeight = useCallback((kind: 'description' | 'tip', height: number) => {
    if (height <= 0) return;
    if (kind === 'description') {
      heightsRef.current.description = Math.max(heightsRef.current.description, height);
    } else {
      heightsRef.current.tipMax = Math.max(heightsRef.current.tipMax, height);
    }
    const stable = Math.max(heightsRef.current.description, heightsRef.current.tipMax);
    setReservedHeight((prev) => (stable > prev ? stable : prev));
  }, []);

  const onVisibleLayout = useCallback(
    (height: number) => {
      registerHeight(contentMode === 'tips' ? 'tip' : 'description', height);
    },
    [contentMode, registerHeight]
  );

  if (dismissed && !hasIntro) return null;
  if (!displayText && dismissed) return null;
  if (!displayText && tips.length === 0) return null;

  const messageNode = (
    <Animated.Text style={[style, styles.message, { opacity: contentOpacity }]}>
      {displayText}
    </Animated.Text>
  );

  const content = tipRoute ? (
    <Pressable
      onPress={openRoute}
      style={styles.messagePressable}
      accessibilityRole="link"
      accessibilityLabel={displayText}
      accessibilityHint="Opens related page"
    >
      {messageNode}
    </Pressable>
  ) : (
    messageNode
  );

  if (headerMode) {
    return (
      <View
        style={[styles.collapseWrap, containerStyle]}
        {...(contentMode === 'tips' ? panResponder.panHandlers : {})}
      >
        {content}
      </View>
    );
  }

  return (
    <View
      style={[
        styles.collapseWrap,
        containerStyle,
        reservedHeight > 0 ? { minHeight: reservedHeight } : null
      ]}
    >
      {/* Hidden measure pass — reserve tallest description/tip height to prevent jump */}
      <View style={styles.measureLayer} pointerEvents="none" accessibilityElementsHidden importantForAccessibility="no">
        {hasIntro ? (
          <Text
            style={[style, styles.message]}
            onLayout={(e) => registerHeight('description', e.nativeEvent.layout.height)}
          >
            {fallbackDescription}
          </Text>
        ) : null}
        {tips.map((msg) => (
          <Text
            key={msg.text}
            style={[style, styles.message]}
            onLayout={(e) => registerHeight('tip', e.nativeEvent.layout.height)}
          >
            {msg.text}
          </Text>
        ))}
      </View>

      <View
        style={styles.visibleLayer}
        onLayout={(e) => onVisibleLayout(e.nativeEvent.layout.height)}
        {...(contentMode === 'tips' ? panResponder.panHandlers : {})}
      >
        {content}
      </View>
    </View>
  );
}

export const ContextGuidanceStrip = memo(ContextGuidanceStripComponent);

function createStyles(s: (n: number) => number, t: (n: number) => number, headerMode: boolean) {
  const tb = (n: number) => bodyText(t, n);

  return StyleSheet.create({
    collapseWrap: {
      width: '100%',
      marginTop: headerMode ? s(8) : s(12),
      position: 'relative'
    },
    measureLayer: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: 0,
      opacity: 0,
      zIndex: -1
    },
    visibleLayer: {
      width: '100%'
    },
    messagePressable: {
      width: '100%'
    },
    message: {
      width: '100%',
      marginTop: 0,
      flexShrink: 1
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: s(4),
      minHeight: s(22)
    },
    metaSpacer: {
      flex: 1
    },
    metaActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(4)
    },
    step: {
      fontFamily: appFonts.accent,
      fontSize: tb(11),
      lineHeight: tb(13),
      color: figmaColors.textMuted,
      letterSpacing: 0.8,
      textTransform: 'uppercase'
    },
    ctaBtn: {
      width: s(26),
      height: s(26),
      alignItems: 'center',
      justifyContent: 'center'
    },
    closeBtn: {
      width: s(26),
      height: s(26),
      alignItems: 'center',
      justifyContent: 'center'
    }
  });
}
