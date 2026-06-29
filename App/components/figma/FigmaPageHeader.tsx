import React, { useMemo } from 'react';
import {
  Image,
  StyleSheet,
  Text,
  View,
  type ImageStyle,
  type StyleProp,
  type TextStyle,
  type ViewStyle
} from 'react-native';
import { ContextGuidanceStrip } from '@/components/context-header/ContextGuidanceStrip';
import { createFigmaPageStyles } from '@/components/figma/figmaPageStyles';
import { FigmaUtilityBar } from '@/components/figma/FigmaUtilityBar';
import type { ContextHeaderPageKey } from '@/constants/contextHeaderContent';
import { figmaSharedIcons } from '@/constants/figmaShared';

/** Space between the header copy band and the page toolbar chips. */
export const HEADER_TOOLBAR_GAP_UNITS = 8;

type FigmaPageHeaderProps = {
  title: string;
  subtitle: string;
  description?: string;
  heroSource: number;
  heroWidth?: number;
  heroHeight?: number;
  s: (n: number) => number;
  page: ReturnType<typeof createFigmaPageStyles>;
  showUtilityBar?: boolean;
  guidanceKey?: ContextHeaderPageKey;
  titleStyle?: StyleProp<TextStyle>;
  subtitleStyle?: StyleProp<TextStyle>;
  descriptionStyle?: StyleProp<TextStyle>;
  heroStyle?: StyleProp<ImageStyle>;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
};

/**
 * Text column and hero image are vertically centered against each other.
 * The image keeps its fixed design height; text wraps naturally beside it.
 */
export function FigmaPageHeader({
  title,
  subtitle,
  description,
  heroSource,
  heroWidth = 182,
  heroHeight = 200,
  s,
  page,
  showUtilityBar = true,
  guidanceKey,
  titleStyle,
  subtitleStyle,
  descriptionStyle,
  heroStyle,
  style,
  children
}: FigmaPageHeaderProps) {
  const heroW = s(heroWidth * 1.5);
  const heroMaxH = s(heroHeight * 1.5);

  const local = useMemo(
    () => createStyles(s, heroW, heroMaxH),
    [s, heroW, heroMaxH]
  );

  return (
    <View style={[page.headerSection, style]}>
      <Text style={[page.title, local.title, titleStyle]}>{title}</Text>
      <Image
        source={figmaSharedIcons.titleBrush}
        style={[page.titleBrush, local.titleBrush]}
        resizeMode="stretch"
      />

      <View style={local.headerRow}>
        <View style={local.headerTextColumn}>
          <Text style={[page.subtitle, local.subtitle, subtitleStyle]}>
            {subtitle}
          </Text>
          {guidanceKey ? (
            <ContextGuidanceStrip
              pageKey={guidanceKey}
              fallbackDescription={description}
              headerMode
              style={[page.description, local.description, descriptionStyle]}
            />
          ) : description ? (
            <Text style={[page.description, local.description, descriptionStyle]}>
              {description}
            </Text>
          ) : null}
        </View>

        <Image
          source={heroSource}
          style={[local.hero, heroStyle]}
          resizeMode="contain"
        />
      </View>

      {showUtilityBar ? <FigmaUtilityBar s={s} /> : null}
      {children}
    </View>
  );
}

function createStyles(s: (n: number) => number, heroW: number, heroMaxH: number) {
  return StyleSheet.create({
    title: {
      width: '100%',
      maxWidth: '100%',
      alignSelf: 'flex-start'
    },
    titleBrush: {
      width: '88%',
      maxWidth: s(400)
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: s(10),
      marginTop: s(4)
    },
    headerTextColumn: {
      flex: 1,
      minWidth: 0,
      paddingTop: s(8)
    },
    subtitle: {
      marginTop: s(12),
      width: '100%'
    },
    description: {
      width: '100%'
    },
    hero: {
      width: heroW,
      height: heroMaxH,
      marginRight: s(20),
      flexShrink: 0
    }
  });
}
