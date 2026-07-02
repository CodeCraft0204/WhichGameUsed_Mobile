import React from 'react';
import { appFonts } from '@/constants/appFonts';
import { ImageBackground, StyleSheet, Text } from 'react-native';
import { bodyText } from '@/constants/appTypography';
import { figmaColors } from '@/constants/figmaColors';
import { formatPoints } from '@/lib/leaderboard';

type Props = {
  points: number;
  pillSource: number;
  s: (n: number) => number;
  t: (n: number) => number;
  wide?: boolean;
  compact?: boolean;
  width?: number;
  height?: number;
  fontSize?: number;
};

/** Ornate gold/silver/bronze pill from Figma with points text overlaid. */
export function LeaderboardPointsPill({
  points,
  pillSource,
  s,
  t,
  wide,
  compact,
  width,
  height,
  fontSize
}: Props) {
  const styles = createStyles(s, t, wide, compact, width, height, fontSize);
  const label = `${formatPoints(points)} pts`;

  return (
    <ImageBackground source={pillSource} style={styles.pill} resizeMode="stretch">
      <Text style={styles.text} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>
        {label}
      </Text>
    </ImageBackground>
  );
}

function createStyles(
  s: (n: number) => number,
  t: (n: number) => number,
  wide?: boolean,
  compact?: boolean,
  width?: number,
  height?: number,
  fontSize?: number
) {
  const tb = (n: number) => bodyText(t, n);

  return StyleSheet.create({
    pill: {
      width: width ?? (wide ? '96%' : undefined),
      minWidth: width ?? (wide ? undefined : s(96)),
      height: height ?? (compact ? s(30) : s(36)),
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: width ? width * 0.1 : s(compact ? 8 : 12),
      marginTop: width ? 0 : s(2)
    },
    text: {
      fontFamily: appFonts.bodyBold,
      fontSize: fontSize ?? tb(compact ? 12 : 14),
      color: figmaColors.charcoal,
      letterSpacing: 0.2,
      textAlign: 'center'
    }
  });
}
