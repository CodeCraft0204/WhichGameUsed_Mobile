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
            <View key={item.key} style={styles.badge}>
              <Image source={src} style={styles.icon} resizeMode="contain" />
              {!compact ? (
                <Text style={styles.label} numberOfLines={1}>
                  {item.label}
                </Text>
              ) : null}
            </View>
          );
        })}
      </View>
    </View>
  );
}

function createStyles(s: (n: number) => number, t: (n: number) => number, compact?: boolean) {
  return StyleSheet.create({
    wrap: { gap: s(6), marginTop: s(8), marginBottom: s(4) },
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
      alignItems: 'center',
      width: s(compact ? 44 : 64),
      gap: s(2)
    },
    icon: {
      width: s(compact ? 40 : 52),
      height: s(compact ? 40 : 52)
    },
    label: {
      fontFamily: appFonts.body,
      fontSize: t(9),
      color: figmaColors.brownMuted,
      textAlign: 'center'
    }
  });
}
