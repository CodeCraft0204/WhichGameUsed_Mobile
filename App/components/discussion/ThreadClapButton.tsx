import React, { useEffect, useMemo, useRef } from 'react';
import { appFonts } from '@/constants/appFonts';
import {
  Animated,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View
} from 'react-native';
import {
  discussionIcons,
  formatClapCount,
  FORUM_MAX_CLAPS_PER_USER
} from '@/constants/discussionContent';
import { figmaColors } from '@/constants/figmaColors';

type ThreadClapButtonProps = {
  totalClaps: number;
  userClaps: number;
  maxed: boolean;
  active?: boolean;
  bubbles: { id: number; key: number }[];
  onPressIn: () => void;
  onPressOut: () => void;
  disabled?: boolean;
  compact?: boolean;
  inline?: boolean;
  s: (n: number) => number;
  t: (n: number) => number;
};

function ClapBubble({ s }: { s: (n: number) => number }) {
  const opacity = useRef(new Animated.Value(1)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 650,
        useNativeDriver: true
      }),
      Animated.timing(translateY, {
        toValue: -s(28),
        duration: 650,
        useNativeDriver: true
      })
    ]).start();
  }, [opacity, s, translateY]);

  return (
    <Animated.Text
      style={{
        position: 'absolute',
        top: -s(6),
        right: s(8),
        fontFamily: appFonts.accent,
        fontSize: s(12),
        color: figmaColors.bronze,
        opacity,
        transform: [{ translateY }]
      }}
    >
      +1
    </Animated.Text>
  );
}

export function ThreadClapButton({
  totalClaps,
  userClaps,
  maxed,
  active = false,
  bubbles,
  onPressIn,
  onPressOut,
  disabled = false,
  compact = false,
  inline = false,
  s,
  t
}: ThreadClapButtonProps) {
  const styles = useMemo(() => createStyles(s, t, compact, inline), [compact, inline, s, t]);
  const iconSize = s(inline ? 16 : 20);

  return (
    <View style={styles.wrap}>
      {bubbles.map((bubble) => (
        <ClapBubble key={bubble.key} s={s} />
      ))}
      <Pressable
        style={[styles.button, (active || userClaps > 0) && styles.buttonActive]}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        disabled={disabled || maxed}
        accessibilityRole="button"
        accessibilityLabel={`Clap for thread. ${userClaps} of ${FORUM_MAX_CLAPS_PER_USER} claps given.`}
      >
        <Image
          source={discussionIcons.threadClap}
          style={{ width: iconSize, height: iconSize * 0.9 }}
          resizeMode="contain"
        />
        {inline ? (
          <Text style={[styles.inlineCount, userClaps > 0 && styles.totalActive]}>
            {formatClapCount(totalClaps)}
          </Text>
        ) : (
          <View style={styles.countBlock}>
            <Text style={styles.clapLabel}>Clap</Text>
            <Text style={[styles.total, userClaps > 0 && styles.totalActive]}>
              {formatClapCount(totalClaps)}
            </Text>
            {userClaps > 0 && !compact ? (
              <Text style={styles.userCount}>
                You · {userClaps}/{FORUM_MAX_CLAPS_PER_USER}
              </Text>
            ) : null}
            {userClaps > 0 && compact ? (
              <Text style={styles.userCountCompact}>You · {userClaps}</Text>
            ) : null}
          </View>
        )}
      </Pressable>
    </View>
  );
}

function createStyles(
  s: (n: number) => number,
  t: (n: number) => number,
  compact: boolean,
  inline: boolean
) {
  return StyleSheet.create({
    wrap: {
      position: 'relative'
    },
    button: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(inline ? 5 : compact ? 6 : 8),
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      borderRadius: s(18),
      paddingHorizontal: s(inline ? 8 : compact ? 10 : 12),
      paddingVertical: s(inline ? 7 : compact ? 7 : 8),
      backgroundColor: figmaColors.cardFeaturedBg,
      minWidth: inline ? undefined : s(compact ? 88 : 108),
      flexShrink: 0
    },
    buttonActive: {
      borderColor: figmaColors.buttonPrimaryBorder,
      backgroundColor: figmaColors.tagBg
    },
    countBlock: {
      alignItems: 'flex-start'
    },
    clapLabel: {
      fontFamily: appFonts.body,
      fontSize: t(compact ? 10 : 11),
      color: figmaColors.gray,
      marginBottom: s(1)
    },
    total: {
      fontFamily: appFonts.body,
      fontSize: t(15),
      color: figmaColors.gray
    },
    totalActive: {
      color: figmaColors.charcoal,
      fontFamily: appFonts.accent
    },
    inlineCount: {
      fontFamily: appFonts.body,
      fontSize: t(13),
      color: figmaColors.gray
    },
    userCount: {
      fontFamily: appFonts.body,
      fontSize: t(10),
      color: figmaColors.bronze,
      marginTop: s(1)
    },
    userCountCompact: {
      fontFamily: appFonts.body,
      fontSize: t(9),
      color: figmaColors.bronze
    }
  });
}
