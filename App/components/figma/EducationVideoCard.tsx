import React from 'react';
import { appFonts } from '@/constants/appFonts';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import type { EducationVideo } from '@/constants/educationContent';
import { figmaColors } from '@/constants/figmaColors';

type EducationVideoCardProps = Omit<EducationVideo, 'key'> & {
  s: (n: number) => number;
  t: (n: number) => number;
  onPress?: () => void;
};

export function EducationVideoCard({
  thumb,
  title,
  channel,
  duration,
  platform,
  publisher,
  contentType,
  isExternal,
  lastReviewed,
  s,
  t,
  onPress
}: EducationVideoCardProps) {
  const styles = createStyles(s, t);
  const typeLabel = contentType === 'web_guide' ? 'GUIDE' : 'VIDEO';

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [styles.card, pressed && onPress ? styles.pressed : null]}
      accessibilityRole={onPress ? 'button' : undefined}
    >
      <View style={styles.thumbWrap}>
        {/* New video thumbs already include play UI — no separate overlay. */}
        <Image source={thumb} style={styles.thumb} resizeMode="cover" />
      </View>

      <View style={styles.body}>
        <View style={styles.metaRow}>
          <View style={styles.chip}>
            <Text style={styles.chipText}>{typeLabel}</Text>
          </View>
          {isExternal ? (
            <View style={[styles.chip, styles.chipExternal]}>
              <Text style={styles.chipText}>EXTERNAL</Text>
            </View>
          ) : null}
        </View>
        <Text style={styles.title} numberOfLines={3}>
          {title}
        </Text>
        <Text style={styles.channel} numberOfLines={1}>
          {publisher || channel}
        </Text>
        <Text style={styles.duration}>
          {duration} · {platform}
        </Text>
        <Text style={styles.reviewed}>Reviewed {lastReviewed}</Text>
      </View>
    </Pressable>
  );
}

function createStyles(s: (n: number) => number, t: (n: number) => number) {
  return StyleSheet.create({
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: figmaColors.cream,
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      borderRadius: s(14),
      minHeight: s(112),
      marginBottom: s(10),
      paddingVertical: s(8),
      paddingHorizontal: s(8),
      gap: s(10)
    },
    pressed: { opacity: 0.92 },
    thumbWrap: {
      width: s(132),
      height: s(96),
      borderRadius: s(8),
      overflow: 'hidden',
      flexShrink: 0,
      backgroundColor: figmaColors.surfaceHighlight
    },
    thumb: {
      width: '100%',
      height: '100%'
    },
    body: {
      flex: 1,
      minWidth: 0,
      justifyContent: 'center',
      gap: s(3),
      paddingRight: s(4)
    },
    metaRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: s(6)
    },
    chip: {
      borderWidth: 1,
      borderColor: figmaColors.borderLight,
      backgroundColor: figmaColors.tagBg,
      borderRadius: s(4),
      paddingHorizontal: s(6),
      paddingVertical: s(2)
    },
    chipExternal: {
      backgroundColor: figmaColors.surfaceHighlight
    },
    chipText: {
      fontFamily: appFonts.accent,
      fontSize: t(9),
      letterSpacing: 0.3,
      color: figmaColors.brown
    },
    title: {
      fontFamily: appFonts.bodyBold,
      fontSize: t(15),
      lineHeight: t(20),
      color: figmaColors.charcoal
    },
    channel: {
      fontFamily: appFonts.body,
      fontSize: t(13),
      lineHeight: t(16),
      color: figmaColors.gray
    },
    duration: {
      fontFamily: appFonts.body,
      fontSize: t(12),
      lineHeight: t(15),
      color: figmaColors.gray
    },
    reviewed: {
      fontFamily: appFonts.body,
      fontSize: t(11),
      color: figmaColors.grayMuted
    }
  });
}
