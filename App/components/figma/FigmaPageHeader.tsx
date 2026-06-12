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
import { createFigmaPageStyles } from '@/components/figma/figmaPageStyles';
import { FigmaUtilityBar } from '@/components/figma/FigmaUtilityBar';
import { figmaSharedIcons } from '@/constants/figmaShared';

type FigmaPageHeaderProps = {
  title: string;
  subtitle: string;
  description?: string;
  heroSource: number;
  /** Design-width units for hero (scaled with `s`). */
  heroWidth?: number;
  heroHeight?: number;
  s: (n: number) => number;
  page: ReturnType<typeof createFigmaPageStyles>;
  showUtilityBar?: boolean;
  titleStyle?: StyleProp<TextStyle>;
  subtitleStyle?: StyleProp<TextStyle>;
  descriptionStyle?: StyleProp<TextStyle>;
  heroStyle?: StyleProp<ImageStyle>;
  style?: StyleProp<ViewStyle>;
  children?: React.ReactNode;
};

/**
 * Page hero header — text fills the left column beside an in-flow illustration
 * (no absolute positioning gap under the copy).
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
  titleStyle,
  subtitleStyle,
  descriptionStyle,
  heroStyle,
  style,
  children
}: FigmaPageHeaderProps) {
  const local = useMemo(() => createStyles(s, heroWidth, heroHeight), [s, heroWidth, heroHeight]);

  return (
    <View style={[page.headerSection, style]}>
      <Text style={[page.title, local.title, titleStyle]}>{title}</Text>
      <Image source={figmaSharedIcons.titleBrush} style={[page.titleBrush, local.titleBrush]} resizeMode="stretch" />

      <View style={local.headerRow}>
        <View style={local.headerTextColumn}>
          <Text style={[page.subtitle, local.subtitle, subtitleStyle]}>{subtitle}</Text>
          {description ? (
            <Text style={[page.description, local.description, descriptionStyle]}>{description}</Text>
          ) : null}
        </View>
        <Image source={heroSource} style={[local.hero, heroStyle]} resizeMode="contain" />
      </View>

      {showUtilityBar ? <FigmaUtilityBar s={s} /> : null}
      {children}
    </View>
  );
}

function createStyles(s: (n: number) => number, heroWidth: number, heroHeight: number) {
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
      alignItems: 'flex-start',
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
      marginTop: s(12),
      width: '100%'
    },
    hero: {
      width: s(heroWidth * 1.5),
      height: s(heroHeight * 1.5),
      marginTop: s(-50),
      marginRight: s(20),
      flexShrink: 0,
    }
  });
}
