import React, { useMemo } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { appFonts } from '@/constants/appFonts';
import { figmaColors } from '@/constants/figmaColors';
import { reputationCopy } from '@/constants/reputationCopy';
import {
  cardEvidenceAttributeCatalog,
  cardEvidenceAttributeImage,
  type CardEvidenceAttributeKey
} from '@/constants/reputationContent';

/** Icons with text labels for active evidence-file attributes. */
export function CardEvidenceAttributeStrip({
  activeKeys,
  s,
  t,
  compact,
  showTitle = true
}: {
  activeKeys: CardEvidenceAttributeKey[];
  s: (n: number) => number;
  t: (n: number) => number;
  compact?: boolean;
  showTitle?: boolean;
}) {
  const styles = useMemo(() => createStyles(s, t, compact), [s, t, compact]);
  if (!activeKeys.length) return null;

  const items = cardEvidenceAttributeCatalog.filter((c) => activeKeys.includes(c.key));

  return (
    <View style={styles.wrap}>
      {!compact && showTitle ? (
        <Text style={styles.title}>{reputationCopy.attributesTitle}</Text>
      ) : null}
      <View style={styles.row}>
        {items.map((item) => {
          const src = cardEvidenceAttributeImage(item.key);
          if (!src) return null;
          return (
            <View
              key={item.key}
              style={styles.badge}
              accessibilityLabel={`${item.label}: ${item.description}`}
            >
              <Image source={src} style={styles.icon} resizeMode="contain" />
              <Text style={styles.label} numberOfLines={2}>
                {item.label}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function createStyles(s: (n: number) => number, t: (n: number) => number, compact?: boolean) {
  return StyleSheet.create({
    wrap: { gap: s(6), marginTop: s(4), marginBottom: s(2) },
    title: {
      fontFamily: appFonts.accent,
      fontSize: t(11),
      letterSpacing: 0.6,
      color: figmaColors.brown
    },
    row: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: s(compact ? 6 : 8)
    },
    badge: {
      flexDirection: compact ? 'column' : 'row',
      alignItems: 'center',
      gap: s(compact ? 2 : 6),
      maxWidth: compact ? s(72) : undefined,
      paddingHorizontal: compact ? 0 : s(8),
      paddingVertical: compact ? 0 : s(6),
      borderRadius: s(10),
      backgroundColor: compact ? 'transparent' : figmaColors.tagBg,
      borderWidth: compact ? 0 : 1,
      borderColor: figmaColors.borderLight
    },
    icon: {
      width: s(compact ? 36 : 28),
      height: s(compact ? 36 : 28)
    },
    label: {
      fontFamily: appFonts.body,
      fontSize: t(compact ? 9 : 11),
      color: figmaColors.ink,
      textAlign: compact ? 'center' : 'left',
      flexShrink: 1,
      maxWidth: compact ? s(68) : s(120)
    }
  });
}
