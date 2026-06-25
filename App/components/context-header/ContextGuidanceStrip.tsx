import { useRouter, type Href } from 'expo-router';
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Image,
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
  CONTEXT_HEADER_COLLAPSE_DISTANCE,
  getContextHeaderConfig,
  type ContextHeaderMessage,
  type ContextHeaderPageKey
} from '@/constants/contextHeaderContent';
import { figmaColors } from '@/constants/figmaColors';
import { figmaSharedIcons } from '@/constants/figmaShared';
import { useContextHeaderScroll } from '@/context/ContextHeaderScrollContext';
import { useFigmaLayout } from '@/hooks/useFigmaLayout';
import {
  // dismissContextHeader,
  isContextHeaderDismissed,
  subscribeContextHeaderSession
} from '@/lib/context-header-session';

type Props = {
  pageKey: ContextHeaderPageKey;
  /** Main page description — shown first, while scrolling, and after dismiss. */
  fallbackDescription?: string;
  style?: StyleProp<TextStyle>;
  containerStyle?: StyleProp<ViewStyle>;
};

const INTRO_DELAY_MS = 5000;
const MESSAGE_CYCLE_MS = 5200;
const FADE_MS = 260;
const SCROLL_DESCRIPTION_THRESHOLD = 12;
const SWIPE_THRESHOLD = 40;

type Phase = 'intro' | 'tips';

function ContextGuidanceStripComponent({
  pageKey,
  fallbackDescription,
  style,
  containerStyle
}: Props) {
  const router = useRouter();
  const { s, t } = useFigmaLayout();
  const scrollCtx = useContextHeaderScroll();
  const config = getContextHeaderConfig(pageKey);
  const styles = useMemo(() => createStyles(s, t), [s, t]);
  const messages = config.messages.filter((m) => m.text);
  const hasIntro = Boolean(fallbackDescription?.trim());
  const [dismissed, setDismissed] = useState(() => isContextHeaderDismissed(pageKey));
  const [phase, setPhase] = useState<Phase>(() =>
    isContextHeaderDismissed(pageKey) || !fallbackDescription?.trim() ? 'tips' : 'intro'
  );
  const [messageIndex, setMessageIndex] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);
  const [measuredHeight, setMeasuredHeight] = useState<number | null>(null);
  const messageOpacity = useRef(new Animated.Value(1)).current;
  const messageIndexRef = useRef(messageIndex);
  const scrolledRef = useRef(false);
  // const dismissible = config.dismissible !== false;
  const layoutKey = useRef('');

  messageIndexRef.current = messageIndex;

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
    messageOpacity.setValue(1);
    setMeasuredHeight(null);
    scrolledRef.current = false;
    setIsScrolled(false);
    if (!isContextHeaderDismissed(pageKey) && fallbackDescription?.trim()) {
      setPhase('intro');
    }
  }, [fallbackDescription, messageOpacity, pageKey]);

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

  const fadeToMessage = useCallback(
    (nextIndex: number) => {
      Animated.timing(messageOpacity, {
        toValue: 0,
        duration: FADE_MS,
        useNativeDriver: true
      }).start(({ finished }) => {
        if (!finished) return;
        setMessageIndex(nextIndex);
        Animated.timing(messageOpacity, {
          toValue: 1,
          duration: FADE_MS,
          useNativeDriver: true
        }).start();
      });
    },
    [messageOpacity]
  );

  const goNext = useCallback(() => {
    if (messages.length <= 1) return;
    fadeToMessage((messageIndex + 1) % messages.length);
  }, [fadeToMessage, messageIndex, messages.length]);

  const goPrev = useCallback(() => {
    if (messages.length <= 1) return;
    fadeToMessage((messageIndex - 1 + messages.length) % messages.length);
  }, [fadeToMessage, messageIndex, messages.length]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gesture) =>
          Math.abs(gesture.dx) > 10 && Math.abs(gesture.dx) > Math.abs(gesture.dy) * 1.2,
        onPanResponderRelease: (_, gesture) => {
          if (gesture.dx <= -SWIPE_THRESHOLD) goNext();
          else if (gesture.dx >= SWIPE_THRESHOLD) goPrev();
        }
      }),
    [goNext, goPrev]
  );

  useEffect(() => {
    if (dismissed || phase !== 'intro' || !hasIntro || isScrolled) return;

    const id = setTimeout(() => {
      Animated.timing(messageOpacity, {
        toValue: 0,
        duration: FADE_MS,
        useNativeDriver: true
      }).start(({ finished }) => {
        if (!finished) return;
        setPhase('tips');
        setMessageIndex(0);
        Animated.timing(messageOpacity, {
          toValue: 1,
          duration: FADE_MS,
          useNativeDriver: true
        }).start();
      });
    }, INTRO_DELAY_MS);

    return () => clearTimeout(id);
  }, [dismissed, hasIntro, isScrolled, messageOpacity, phase]);

  useEffect(() => {
    if (phase !== 'tips' || messages.length <= 1 || dismissed || isScrolled) return;

    const id = setInterval(() => {
      const next = (messageIndexRef.current + 1) % messages.length;
      fadeToMessage(next);
    }, MESSAGE_CYCLE_MS);

    return () => clearInterval(id);
  }, [dismissed, fadeToMessage, isScrolled, messages.length, phase]);

  const showTips =
    !dismissed && !isScrolled && phase === 'tips' && messages.length > 0;

  const activeMessage: ContextHeaderMessage | undefined = messages[messageIndex] ?? messages[0];
  // const stepLabel = showTips && messages.length > 1 ? `${messageIndex + 1} of ${messages.length}` : null;

  const displayText = showTips
    ? activeMessage?.text ?? ''
    : dismissed && hasIntro
      ? fallbackDescription
      : phase === 'intro' && hasIntro
        ? fallbackDescription
        : isScrolled && hasIntro
          ? fallbackDescription
          : activeMessage?.text ?? fallbackDescription ?? '';

  const openRoute = useCallback(() => {
    if (!activeMessage?.route) return;
    router.push(activeMessage.route as Href);
  }, [activeMessage?.route, router]);

  // const handleDismiss = useCallback(() => {
  //   dismissContextHeader(pageKey);
  //   setDismissed(true);
  //   setPhase('tips');
  //   messageOpacity.setValue(1);
  // }, [messageOpacity, pageKey]);

  const collapseOpacity =
    scrollCtx && !isScrolled
      ? scrollCtx.scrollY.interpolate({
          inputRange: [0, CONTEXT_HEADER_COLLAPSE_DISTANCE],
          outputRange: [1, 0],
          extrapolate: 'clamp'
        })
      : 1;

  const collapseMaxHeight =
    measuredHeight != null && scrollCtx && !isScrolled
      ? scrollCtx.scrollY.interpolate({
          inputRange: [0, CONTEXT_HEADER_COLLAPSE_DISTANCE],
          outputRange: [measuredHeight, 0],
          extrapolate: 'clamp'
        })
      : measuredHeight ?? undefined;

  const onContentLayout = useCallback((height: number) => {
    const key = `${phase}:${messageIndex}:${isScrolled}:${displayText.length}`;
    if (height > 0 && (measuredHeight == null || layoutKey.current !== key)) {
      layoutKey.current = key;
      setMeasuredHeight(height);
    }
  }, [displayText.length, isScrolled, measuredHeight, messageIndex, phase]);

  if (dismissed && !hasIntro) return null;
  if (!displayText && dismissed) return null;
  if (!displayText && messages.length === 0) return null;

  return (
    <Animated.View
      style={[
        styles.collapseWrap,
        containerStyle,
        collapseMaxHeight != null ? { maxHeight: collapseMaxHeight } : null,
        { opacity: collapseOpacity }
      ]}
      accessibilityRole="summary"
      accessibilityLabel={displayText}
    >
      <View
        onLayout={(e) => {
          onContentLayout(e.nativeEvent.layout.height);
        }}
        {...(showTips ? panResponder.panHandlers : {})}
      >
        {/* Tips chrome — step counter and close hidden per client request
        {showTips ? (
          <View style={styles.metaRow}>
            {stepLabel ? <Text style={styles.step}>{stepLabel}</Text> : <View style={styles.metaSpacer} />}
            <View style={styles.metaActions}>
              {activeMessage?.route ? (
                <Pressable
                  onPress={openRoute}
                  hitSlop={10}
                  style={styles.ctaBtn}
                  accessibilityRole="button"
                  accessibilityLabel="Open related page"
                >
                  <Image source={figmaSharedIcons.sectionChevron} style={styles.ctaArrow} resizeMode="contain" />
                </Pressable>
              ) : null}
              {dismissible ? (
                <Pressable
                  onPress={handleDismiss}
                  hitSlop={10}
                  style={styles.closeBtn}
                  accessibilityRole="button"
                  accessibilityLabel="Dismiss tips"
                >
                  <Ionicons name="close" size={s(18)} color={figmaColors.brownMuted} />
                </Pressable>
              ) : null}
            </View>
          </View>
        ) : null}
        */}

        <Animated.Text style={[style, styles.message, { opacity: messageOpacity }]}>
          {displayText}
        </Animated.Text>

        {showTips && activeMessage?.route ? (
          <Pressable
            onPress={openRoute}
            hitSlop={10}
            style={styles.ctaBtn}
            accessibilityRole="button"
            accessibilityLabel="Open related page"
          >
            <Image source={figmaSharedIcons.sectionChevron} style={styles.ctaArrow} resizeMode="contain" />
          </Pressable>
        ) : null}
      </View>
    </Animated.View>
  );
}

export const ContextGuidanceStrip = memo(ContextGuidanceStripComponent);

function createStyles(s: (n: number) => number, t: (n: number) => number) {
  const tb = (n: number) => bodyText(t, n);

  return StyleSheet.create({
    collapseWrap: {
      width: '100%',
      overflow: 'hidden',
      marginTop: s(12)
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
    message: {
      width: '100%',
      marginTop: 0,
      flexShrink: 1
    },
    ctaBtn: {
      width: s(26),
      height: s(26),
      alignItems: 'center',
      justifyContent: 'center'
    },
    ctaArrow: {
      width: s(10),
      height: s(17),
      tintColor: figmaColors.brownMuted
    },
    closeBtn: {
      width: s(26),
      height: s(26),
      alignItems: 'center',
      justifyContent: 'center'
    }
  });
}
