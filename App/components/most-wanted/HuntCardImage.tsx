import { Ionicons } from '@expo/vector-icons';
import React, { useMemo } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { databaseIcons } from '@/constants/databaseContent';
import { figmaColors } from '@/constants/figmaColors';

type HuntCardImageProps = {
  coverImageUrl?: string | null;
  imageUrl?: string | null;
  style?: object;
  framed?: boolean;
  s?: (n: number) => number;
};

export function HuntCardImage({ coverImageUrl, imageUrl, style, framed, s }: HuntCardImageProps) {
  const uri = imageUrl ?? coverImageUrl;
  const frameStyles = useMemo(
    () => (framed && s ? createFrameStyles(s) : null),
    [framed, s]
  );

  const image = uri ? (
    <Image source={{ uri }} style={style} resizeMode="contain" />
  ) : (
    <Image source={databaseIcons.cardPlaceholder} style={style} resizeMode="contain" />
  );

  if (frameStyles) {
    return <View style={frameStyles.frame}>{image}</View>;
  }

  return image;
}

function createFrameStyles(s: (n: number) => number) {
  return StyleSheet.create({
    frame: {
      width: '100%',
      backgroundColor: figmaColors.assetPreviewBg,
      borderRadius: s(10),
      borderWidth: 1,
      borderColor: figmaColors.assetPreviewBorder,
      overflow: 'hidden',
      alignItems: 'center',
      justifyContent: 'center'
    }
  });
}
